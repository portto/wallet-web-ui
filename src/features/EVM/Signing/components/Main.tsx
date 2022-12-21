import { useCallback } from "react";
import { Box, Button, Flex, Img } from "@chakra-ui/react";
import { signEthereumMessage } from "apis";
import { useSigningMachine } from "machines/signing";
import { logSignTx } from "services/Amplitude";

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

  return (
    <Box fontSize={10}>
      <Box>Dapp</Box>
      <Box px={4}>
        <Box>Dapp name: {dapp.name}</Box>
        <Flex align="center">
          Dapp Logo: <Img width={8} height={8} src={dapp.logo} />
        </Flex>
        <Box>Dapp URL: {dapp.url}</Box>
      </Box>
      <Box>Message</Box>
      <Box px={4}>
        <Box>Raw message: {message.raw}</Box>
        <Box>Message to be signed: {message.toBeSigned}</Box>
      </Box>
      <Flex justify="center">
        <Button onClick={approve}>Approve</Button>
      </Flex>
    </Box>
  );
};

export default Main;
