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
    id: "app.genaral.message",
    defaultMessage: "Message",
  },
  approve: {
    id: "app.genaral.approve",
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
    <>
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

      <Flex
        flexDirection="column"
        justifyContent="space-between"
        px="space.l"
        pb="space.m"
      >
        <Box>
          <Field title={<FormattedMessage {...messages.message} />}>
            {message.toBeSigned}
          </Field>
          <FieldLine />
        </Box>

        <Box>
          <Button onClick={approve}>
            <FormattedMessage {...messages.approve} />
          </Button>
        </Box>
      </Flex>
    </>
  );
};

export default Main;
