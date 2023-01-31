import { Box, Flex, Heading } from "@chakra-ui/react";
import { ReactNode } from "react";
import { ReactComponent as CheckAlert } from "src/assets/images/icons/check-alert.svg";
import { ReactComponent as CheckVerified } from "src/assets/images/icons/check-verified.svg";
import FormattedMessage from "src/components/FormattedMessage";

const TransactionContent = ({
  children,
  verified,
}: {
  children: ReactNode;
  verified?: boolean;
}) => {
  return (
    <>
      <Heading
        as="h3"
        fontSize="size.heading.3"
        fontWeight="weight.l"
        mb="space.m"
      >
        <FormattedMessage intlKey="app.authz.operation" />
      </Heading>
      {verified ? (
        <Flex
          padding="space.m"
          alignItems="center"
          bg="background.secondary"
          borderRadius="12px"
        >
          <CheckVerified />
          <Box ml="space.xs" fontSize="size.body.3">
            <FormattedMessage intlKey="app.authz.operationVerified" />
          </Box>
        </Flex>
      ) : (
        <Flex
          padding="space.m"
          alignItems="center"
          bg="background.alert"
          borderRadius="12px"
        >
          <CheckAlert />
          <Box ml="space.xs" fontSize="size.body.3">
            <FormattedMessage intlKey="app.authz.operationNotVerified" />
          </Box>
        </Flex>
      )}
      <Box mt="space.xl" wordBreak="break-all" fontSize="size.body.3">
        {children}
      </Box>
    </>
  );
};
export default TransactionContent;
