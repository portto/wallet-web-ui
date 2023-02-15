import { Box, Center, Flex, Text } from "@chakra-ui/react";
import { useCallback } from "react";
import { ReactComponent as CheckAlert } from "src/assets/images/icons/check-alert.svg";
import Button from "src/components/Button";
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
          <Flex flexDirection="column" alignItems="center" px="space.s">
            <CheckAlert width={48} height={48} />
            <Text
              fontSize="size.heading.4"
              fontWeight="weight.l"
              lineHeight="line.height.subheading.1"
              mb="space.2xs"
              mt="space.s"
              textAlign="center"
            >
              <FormattedMessage intlKey="app.authz.warning" />
            </Text>

            <Text textAlign="center">
              <FormattedMessage intlKey="app.authz.maliciousHint" />
            </Text>
          </Flex>
        </Center>
      </Box>
      <Box position="absolute" bottom="space.l" px="space.l" width="100%">
        <Button onClick={handleClose}>
          <FormattedMessage intlKey="app.authz.stopTransaction" />
        </Button>
      </Box>
    </Box>
  );
};

export default DangerousTxAlert;
