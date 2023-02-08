import { Box, Center, Flex, Text } from "@chakra-ui/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createSigningRequest, getSigningRequest } from "src/apis";
import FormattedMessage from "src/components/FormattedMessage";
import Header from "src/components/Header";
import LoadingLogo from "src/components/LoadingLogo";
import { useSigningMachine } from "src/machines/signing";
import { logSignTx } from "src/services/Amplitude";
import { AptosNonCustodialSigningResponse } from "src/types";
import { ERROR_MESSAGES } from "src/utils/constants";

const POLLING_INTERVAL = 1000;

function getBitmap(deviceKeyIndex: number) {
  const cosignerIndex = 0;
  const bitmap = [];
  if (deviceKeyIndex >= 0) {
    /* eslint-disable no-bitwise */
    let value = (1 << deviceKeyIndex) + (1 << cosignerIndex);
    for (let i = 0; i < 4; i++) {
      bitmap.push(value % 256);
      value >>= 8;
    }
    /* eslint-enable no-bitwise */
  }
  return bitmap;
}

const NonCustodial = () => {
  const timerRef = useRef<NodeJS.Timeout>();
  const [signingRequestId, setSigningRequestId] = useState<string>("");
  const { context, send } = useSigningMachine();

  const {
    dapp: { blockchain, id: appId = "", url = "", name = "", logo = "" },
  } = context;
  const domain = url ? new URL(url).host : "";

  // create non custodial signing request
  useEffect(() => {
    const { raw, meta: { nonce, address, application, chainId } = {} } =
      context.message;

    createSigningRequest({
      title: name,
      image: logo,
      blockchain,
      url,
      type: "sign_message",
      message: raw,
      nonce,
      address,
      application,
      chain_id: chainId,
    }).then(({ id }) => {
      setSigningRequestId(id);
    });
    // intentionally run once
    // eslint-disable-next-line
  }, []);

  const pollWalletStatus = async () => {
    const result = await getSigningRequest({
      blockchain,
      id: signingRequestId,
    });

    const {
      status,
      signatures: signature,
      device_key_index,
      full_message: toBeSigned,
      message: raw,
      chain_id: chainId,
      ...meta
    } = result as AptosNonCustodialSigningResponse;

    if (status === "pending") {
      timerRef.current = setTimeout(pollWalletStatus, POLLING_INTERVAL);
      return;
    }

    if (status === "approve") {
      logSignTx({
        domain,
        url,
        chain: blockchain,
        dAppName: name,
        dAppId: appId,
      });
      send({
        type: "approve",
        data: {
          signature,
          bitmap: getBitmap(device_key_index),
          toBeSigned,
          raw,
          meta: {
            chainId,
            ...meta,
          },
        },
      });
    } else {
      send({
        type: "reject",
        data: { error: ERROR_MESSAGES.SIGN_DECLINE_ERROR },
      });
    }
  };

  useEffect(() => {
    if (signingRequestId) {
      pollWalletStatus();
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signingRequestId]);

  const handleClose = useCallback(
    () =>
      send({
        type: "reject",
        data: { error: ERROR_MESSAGES.SIGN_DECLINE_ERROR },
      }),
    [send]
  );

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
