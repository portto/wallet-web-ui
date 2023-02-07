import { Box, Center, Flex, Text } from "@chakra-ui/react";
import { useCallback } from "react";
import { updateNonCustodial } from "src/apis";
import FormattedMessage from "src/components/FormattedMessage";
import Header from "src/components/Header";
import LoadingLogo from "src/components/LoadingLogo";
import { useTransactionMachine } from "src/machines/transaction";

const NonCustodial = () => {
  const { context, send } = useTransactionMachine();
  const { authorizationId, sessionId } = context.user;

  const handleClose = useCallback(() => {
    if (authorizationId && sessionId) {
      updateNonCustodial({ authorizationId, sessionId }).then(() =>
        send("close")
      );
    }
  }, [authorizationId, send, sessionId]);

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
              <FormattedMessage intlKey="feature.transaction.nonCustodial.title" />
            </Text>
            <Text fontSize="size.body.3" textAlign="center">
              <FormattedMessage intlKey="feature.transaction.nonCustodial.description" />
            </Text>
          </Flex>
        </Center>
      </Box>
    </Box>
  );
};

export default NonCustodial;
