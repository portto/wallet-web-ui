import { Box, Center, Flex, Text } from "@chakra-ui/react";
import { useCallback } from "react";
import { ReactComponent as CheckAlert } from "src/assets/images/icons/check-alert.svg";
import FormattedMessage from "src/components/FormattedMessage";
import Header from "src/components/Header";
import { useTransactionMachine } from "src/machines/transaction";

const DangerousTxAlert = () => {
  const { context, send } = useTransactionMachine();

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
            <CheckAlert />
            <Text
              fontSize="size.heading.4"
              fontWeight="weight.l"
              lineHeight="line.height.subheading.1"
              mb="space.2xs"
              mt="space.s"
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

export default DangerousTxAlert;
