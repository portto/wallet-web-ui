import { Box, Flex, Text } from "@chakra-ui/react";
import { useCallback, useState } from "react";
import { updateSignatureDetails } from "src/apis";
import Button from "src/components/Button";
import DappLogo from "src/components/DappLogo";
import Field, { FieldLine } from "src/components/Field";
import FormattedMessage from "src/components/FormattedMessage";
import Header from "src/components/Header";
import { useSigningMachine } from "src/machines/signing";
import { logSignTx } from "src/services/Amplitude";
import { EVMUpdateSignatureDetailsResponse } from "src/types";
import { ERROR_MESSAGES } from "src/utils/constants";

const Main = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { context, send } = useSigningMachine();
  const {
    user: { sessionId = "" },
    message: { raw },
    signatureId,
    dapp: { blockchain, id = "", url = "", name = "", logo = "" },
  } = context;

  const approve = useCallback(async () => {
    setIsLoading(true);

    if (!signatureId) {
      return;
    }

    const domain = url ? new URL(url).host : "";
    logSignTx({ domain, url, chain: blockchain, dAppName: name, dAppId: id });

    updateSignatureDetails({
      signatureId,
      sessionId,
      action: "approve",
      blockchain,
    }).then((result) => {
      const { signature } = result as EVMUpdateSignatureDetailsResponse;
      send({
        type: "approve",
        data: { signature },
      });
    });
  }, [signatureId, url, blockchain, name, id, sessionId, send]);

  const handleClose = useCallback(() => {
    if (signatureId) {
      updateSignatureDetails({
        signatureId,
        sessionId,
        action: "decline",
        blockchain,
      });
    }
    send({
      type: "reject",
      data: { error: ERROR_MESSAGES.SIGN_DECLINE_ERROR },
    });
  }, [blockchain, send, sessionId, signatureId]);

  return (
    <Flex flexDirection="column">
      <Header
        bg="background.secondary"
        blockchain={blockchain}
        onClose={handleClose}
      />

      <Flex
        flexDirection="column"
        alignItems="center"
        pb="space.xl"
        bg="background.secondary"
      >
        <DappLogo url={logo} mb="space.s" />
        <Text fontSize="size.body.3" mb="space.2xs">
          <FormattedMessage intlKey="feature.sign.title" />
        </Text>
        <Text
          px="space.m"
          py="space.3xs"
          fontSize="size.subheading.2"
          fontWeight="weight.m"
          lineHeight="line.height.subheading.2"
          bg="background.primary"
          borderRadius="32px"
        >
          {url}
        </Text>
      </Flex>

      <Box flex="1 0 0" px="space.l" overflow="auto">
        <Field title={<FormattedMessage intlKey="app.general.message" />}>
          {raw}
        </Field>
        <FieldLine />
      </Box>

      <Box
        flex="0 0 auto"
        px="space.l"
        py="space.m"
        boxShadow="0px 0px 10px rgba(35, 37, 40, 0.05)"
      >
        <Button onClick={approve} isLoading={isLoading}>
          <FormattedMessage intlKey="app.general.approve" />
        </Button>
      </Box>
    </Flex>
  );
};

export default Main;
