import { Box, Center, Flex, Text } from "@chakra-ui/react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  createSigningRequest,
  getSigningRequest,
  updateSignatureDetails,
} from "src/apis";
import FormattedMessage from "src/components/FormattedMessage";
import Header from "src/components/Header";
import LoadingLogo from "src/components/LoadingLogo";
import { useSigningMachine } from "src/machines/signing";
import { logSignature } from "src/services/Amplitude";
import { EVMNonCustodialSigningResponse } from "src/types";
import { ERROR_MESSAGES } from "src/utils/constants";

const POLLING_INTERVAL = 1000;

const NonCustodial = () => {
  const timerRef = useRef<NodeJS.Timeout>();
  const { context, send } = useSigningMachine();
  const [signingRequestId, setSigningRequestId] = useState<string>("");

  const {
    dapp: { blockchain, url = "", name = "", logo = "", id = "" },
    signatureId,
    user: { sessionId = "" },
  } = context;
  const domain = url ? new URL(url).host : "";

  // create non custodial signing request
  useEffect(() => {
    const { toBeSigned, meta: { method, dataType } = {} } = context.message;

    createSigningRequest({
      title: name,
      image: logo,
      blockchain,
      url,
      type: method,
      message: toBeSigned,
      data_type: dataType,
    }).then(({ id }) => {
      setSigningRequestId(id);
    });
    // intentionally run once
    // eslint-disable-next-line
  }, []);

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

  const pollSigningRequest = () => {
    getSigningRequest({ id: signingRequestId, blockchain }).then((result) => {
      const { status, signature } = result as EVMNonCustodialSigningResponse;
      if (status === "pending") {
        return (timerRef.current = setTimeout(
          pollSigningRequest,
          POLLING_INTERVAL
        ));
      }
      if (status === "approve") {
        logSignature({
          domain,
          chain: blockchain,
          dAppName: name,
          dAppId: id,
        });
        send({
          type: "approve",
          data: { signature },
        });
      } else if (status === "reject") {
        handleClose();
      }
    });
  };

  useEffect(() => {
    if (signingRequestId) {
      // check signing request status
      pollSigningRequest();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signingRequestId]);

  return (
    <Box position="relative">
      <Header blockchain={blockchain} onClose={handleClose} />
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
