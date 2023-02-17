import { Box, Center, Flex, Text } from "@chakra-ui/react";
import { useCallback, useEffect } from "react";
import { checkEmailExist, getAuthnQueue, requestEmailAuth } from "src/apis";
import FormattedMessage from "src/components/FormattedMessage";
import Header from "src/components/Header";
import LoadingLogo from "src/components/LoadingLogo";
import { useAuthenticateMachine } from "src/machines/authenticate";
import checkEmailFormat from "src/utils/checkEmailFormat";

const getQueueReady = ({
  queueNumber = 0,
  readyNumber = 0,
  queueId = 0,
} = {}) => {
  return new Promise<boolean>((resolve) => {
    if (readyNumber >= queueNumber) {
      resolve(true);
    }
    const interval = setInterval(() => {
      getAuthnQueue(queueId).then(
        ({
          queueNumber: updatedQueueNumber,
          readyNumber: updatedReadyNumber,
        }) => {
          if (updatedReadyNumber >= updatedQueueNumber) {
            clearInterval(interval);
            resolve(true);
          }
        }
      );
    }, 1000);
  });
};

const getLoginAction = (email?: string) => {
  return new Promise((resolve: (result?: "login" | "register") => void) => {
    if (!email) {
      return resolve();
    }

    if (!checkEmailFormat(email)) {
      return resolve();
    }

    checkEmailExist(email).then(({ exist }) => {
      resolve(exist ? "login" : "register");
    });
  });
};

const Queueing = () => {
  const { context, send } = useAuthenticateMachine();
  const { email } = context.user;

  useEffect(() => {
    Promise.all([getQueueReady(context.queue), getLoginAction(email)]).then(
      ([_isReady, action]) => {
        if (!action) {
          send("ready");
        } else {
          requestEmailAuth({ action, email }).then(({ id }) => {
            if (id) {
              send({ type: "otp", data: { email, authCodeId: id, action } });
            }
          });
        }
      }
    );
  }, [context.queue, email, send]);

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
              <FormattedMessage intlKey="feature.authn.queue.title" />
            </Text>
            <Text fontSize="size.body.3" textAlign="center">
              <FormattedMessage intlKey="feature.authn.queue.description" />
            </Text>
          </Flex>
        </Center>
      </Box>
    </Box>
  );
};

export default Queueing;
