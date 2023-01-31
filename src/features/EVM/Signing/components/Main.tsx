import { Box, Flex, Text } from "@chakra-ui/react";
import { useCallback } from "react";
import { FormattedMessage, defineMessages } from "react-intl";
import { signEthereumMessage } from "src/apis";
import Button from "src/components/Button";
import DappLogo from "src/components/DappLogo";
import Field, { FieldLine } from "src/components/Field";
import Header from "src/components/Header";
import { useSigningMachine } from "src/machines/signing";
import { logSignTx } from "src/services/Amplitude";

const messages = defineMessages({
  title: {
    id: "feature.sign.title",
    defaultMessage: "You are signing for",
  },
  message: {
    id: "app.general.message",
    defaultMessage: "Message",
  },
  approve: {
    id: "app.general.approve",
    defaultMessage: "Approve",
  },
});

const Main = () => {
  const { context, send } = useSigningMachine();

  const { user, message, dapp } = context;

  const approve = useCallback(async () => {
    const { sessionId = "" } = user;
    const { blockchain, id = "", url = "", name = "" } = context.dapp;
    const domain = new URL(url).host;

    logSignTx({ domain, url, chain: blockchain, dAppName: name, dAppId: id });

    const { signature } = await signEthereumMessage({
      chain: blockchain,
      message: message.toBeSigned || "",
      sessionId,
    });
    send({ type: "approve", data: { signature } });
  }, [user, dapp, message]);

  const handleClose = useCallback(() => send("close"), [send]);

  return (
    <Flex flexDirection="column">
      <Header
        bg="background.secondary"
        blockchain={context.dapp.blockchain}
        onClose={handleClose}
      />

      <Flex
        flexDirection="column"
        alignItems="center"
        pb="space.xl"
        bg="background.secondary"
      >
        <DappLogo url={context.dapp.logo || ""} mb="space.s" />
        <Text fontSize="size.body.3" mb="space.2xs">
          <FormattedMessage {...messages.title} />
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
          {context.dapp.url}
        </Text>
      </Flex>

      <Box flex="1 0 0" px="space.l" overflow="auto">
        <Field title={<FormattedMessage {...messages.message} />}>
          {message.toBeSigned}
        </Field>
        <FieldLine />
      </Box>

      <Box
        flex="0 0 auto"
        px="space.l"
        py="space.m"
        boxShadow="0px 0px 10px rgba(35, 37, 40, 0.05)"
      >
        <Button onClick={approve}>
          <FormattedMessage {...messages.approve} />
        </Button>
      </Box>
    </Flex>
  );
};

export default Main;
