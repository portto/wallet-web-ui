import { Box, Center, Flex, Text } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { createSigningRequest, getSigningRequest } from "src/apis";
import FormattedMessage from "src/components/FormattedMessage";
import Header from "src/components/Header";
import LoadingLogo from "src/components/LoadingLogo";
import { useSigningMachine } from "src/machines/signing";
import { logSendTx } from "src/services/Amplitude";
import { ERROR_MESSAGES } from "src/utils/constants";

const NonCustodial = () => {
  const { context, send } = useSigningMachine();
  const [signingRequestId, setSigningRequestId] = useState<string>("");

  const { user, message, dapp } = context;

  // create non custodial signing request
  useEffect(() => {
    const { blockchain, url = "", name = "", logo = "" } = dapp;
    const { toBeSigned } = message;

    createSigningRequest({
      title: name,
      image: logo,
      blockchain,
      url,
      type: "tx",
      message: toBeSigned,
    }).then(({ id }) => setSigningRequestId(id));
  }, [user.sessionId, message.toBeSigned, dapp.blockchain]);

  // check signing request status
  useEffect(() => {
    const { id = "", blockchain, url = "", name = "" } = dapp;
    const domain = new URL(url).host;

    const interval = setInterval(async () => {
      const { status, tx_hash: txHash } = await getSigningRequest({
        blockchain,
        id: signingRequestId,
      });
      if (status === "approve") {
        logSendTx({
          domain,
          url,
          chain: blockchain,
          type: "authz",
          dAppName: name,
          dAppId: id,
        });
        clearInterval(interval);
        send({ type: "approve", data: { txHash } });
      } else if (status === "reject") {
        send({
          type: "reject",
          data: { failReason: ERROR_MESSAGES.AUTHZ_DECLINE_ERROR },
        });
        clearInterval(interval);
      }
    }, 1000);

    return clearInterval(interval);
  }, []);

  const handleClose = useCallback(() => send("close"), [send]);

  return (
    <Box position="relative">
      <Header blockchain={context.dapp.blockchain} onClose={handleClose} />
      <Box
        position="absolute"
        top="0"
        left="0"
        zIndex={-1}
        width="100%"
        height="100%"
      >
        <Center height="100%">
          <Flex flexDirection="column" alignItems="center">
            <LoadingLogo mb="space.s" />
            <Text
              fontSize="size.heading.4"
              fontWeight="weight.l"
              lineHeight="line.height.subheading.1"
              mb="space.2xs"
            >
              <FormattedMessage intlKey="feature.sign.nonCustodial.title" />
            </Text>
            <Text fontSize="size.body.3" textAlign="center">
              <FormattedMessage intlKey="feature.sign.nonCustodial.description" />
            </Text>
          </Flex>
        </Center>
      </Box>
    </Box>
  );
};

export default NonCustodial;
