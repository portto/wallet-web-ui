import {
  Box,
  Button as ChakraButton,
  Flex,
  Image,
  Text,
} from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { createHandshake } from "src/apis";
import Button from "src/components/Button";
import DappLogo from "src/components/DappLogo";
import Field, { FieldLine } from "src/components/Field";
import FormattedMessage from "src/components/FormattedMessage";
import Header from "src/components/Header";
import { useAuthenticateMachine } from "src/machines/authenticate";
import { logAuthenticated } from "src/services/Amplitude";
import { checkCollectionEnabled, enableCollection } from "src/services/Flow";
import { KEY_SESSION_ID, setItem } from "src/services/LocalStorage";
import { Chains, CompositeSignature } from "src/types";
import formatAddress from "src/utils/formatAddress";

const PRE_ENABLE_HOSTS = [
  "nft-store.blocto.app",
  "nft-store-staging.blocto.app",
];

const AccountConifrm = () => {
  const { context, send } = useAuthenticateMachine();
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [handshakeData, setHandshakeData] = useState<{
    paddr?: string;
    code?: string;
    signatures?: CompositeSignature[];
  }>({});
  const {
    dapp: { id: dAppId = "", name: dAppName = "", logo, url = "", blockchain },
    user: {
      id: userId,
      email,
      type: userType,
      addresses,
      deviceKey,
      deviceId,
      signatureData,
    },
    blockchainIcon,
  } = context;
  const domain = url ? new URL(url).host : "";

  useEffect(() => {
    // create session with api server
    createHandshake({
      blockchain,
      email,
      userId,
      address: addresses,
      domain,
      appId: dAppId,
      userType,
      metadata: {
        title: dAppName,
        thumbnail: logo,
      },
      deviceKey,
      deviceId,
      signatureData,
    }).then(({ paddr, code, signatures = [] }) => {
      setHandshakeData({ paddr, code, signatures });
      setItem(KEY_SESSION_ID, code);
      // log authenticated event
      logAuthenticated({ chain: blockchain, domain, dAppName, dAppId });
    });
    // intentionally run once
    // eslint-disable-next-line
  }, []);

  // @todo: Move to {RunInitScripts}
  const checkAccountPreEnable = async () => {
    const isFlow = blockchain === Chains.flow;
    const shouldPreEnable = isFlow && PRE_ENABLE_HOSTS.includes(domain);

    // if shouldn't check, assume locked address created
    const maybeCheckPreEnabled = shouldPreEnable
      ? checkCollectionEnabled
      : () => Promise.resolve(true);

    const flowAddress = addresses?.[blockchain] || "";
    const isEnabled = await maybeCheckPreEnabled(flowAddress);
    if (isEnabled) {
      return;
    }

    return enableCollection(flowAddress, domain);
  };

  const approve = async () => {
    setHasSubmitted(true);

    try {
      await checkAccountPreEnable();

      const { paddr, code, signatures } = handshakeData;
      send({
        type: "approve",
        data: {
          accountInfo: {
            paddr,
            code,
          },
          signatures,
        },
      });
    } catch (error) {
      setHasSubmitted(false);
    }
  };

  const switchAccount = useCallback(async () => {
    send("switchAccount");
  }, [send]);

  const handleClose = useCallback(() => send("close"), [send]);

  return (
    <>
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
        <DappLogo url={logo || ""} mb="space.s" />
        <Text fontSize="size.body.3" mb="space.2xs">
          <FormattedMessage intlKey="feature.authn.confirm.title" />
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

      <Flex flexDirection="column" justifyContent="space-between" px="space.l">
        <Box>
          <Field title={<FormattedMessage intlKey="app.general.email" />}>
            {email}
          </Field>
          <FieldLine />
          <Field
            title={
              <FormattedMessage
                intlKey="app.general.address"
                values={{
                  chain:
                    blockchain.charAt(0).toUpperCase() + blockchain.slice(1),
                }}
              />
            }
            icon={<Image src={blockchainIcon} width="16px" height="16px" />}
          >
            {formatAddress(addresses?.[blockchain])}
          </Field>
          <FieldLine />
        </Box>

        <Box>
          <Button isLoading={hasSubmitted} onClick={approve}>
            <FormattedMessage intlKey="app.general.approve" />
          </Button>
          <ChakraButton
            onClick={switchAccount}
            width="100%"
            height="38px"
            my="space.2xs"
            bg="background.primary"
            color="font.highlight"
            fontSize="size.body.2"
            fontWeight="weight.s"
            _hover={{ bg: "none", transform: "scale(0.98)" }}
            _active={{ bg: "none", transform: "scale(0.96)" }}
          >
            <FormattedMessage intlKey="feature.authn.confirm.useAnotherAccount" />
          </ChakraButton>
        </Box>
      </Flex>
    </>
  );
};

export default AccountConifrm;
