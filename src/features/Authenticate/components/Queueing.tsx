import { Box, Center, Flex, Text } from "@chakra-ui/react";
import { useEffect } from "react";
import { FormattedMessage } from "react-intl";
import { getAuthnQueue } from "src/apis";
import Header from "src/components/Header";
import LoadingLogo from "src/components/LoadingLogo";
import { useAuthenticateMachine } from "src/machines/authenticate";

const Queueing = () => {
  const { context, send } = useAuthenticateMachine();

  // check queue status
  useEffect(() => {
    const {
      queueNumber = 0,
      readyNumber = 0,
      queueId = 0,
    } = context.queue || {};
    if (readyNumber >= queueNumber) {
      send("ready");
    }
    const interval = setInterval(() => {
      getAuthnQueue(queueId).then(
        ({
          queueNumber: updatedQueueNumber,
          readyNumber: updatedReadyNumber,
        }) => (updatedReadyNumber >= updatedQueueNumber ? send("ready") : null)
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [send, context.queue]);

  const handleClose = () => send("close");

  return (
    <Box height="100%" position="relative">
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
              <FormattedMessage id="feature.authn.queue.title" />
            </Text>
            <Text fontSize="size.body.3" textAlign="center">
              <FormattedMessage id="feature.authn.queue.description" />
            </Text>
          </Flex>
        </Center>
      </Box>
    </Box>
  );
};

export default Queueing;
