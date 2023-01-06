import { Box, Flex, Heading } from "@chakra-ui/react";
import { ReactNode } from "react";
import { FormattedMessage } from "react-intl";
import { ReactComponent as CheckAlert } from "src/assets/images/icons/check-alert.svg";
import { ReactComponent as CheckVerified } from "src/assets/images/icons/check-verified.svg";
import messages from "./messages";

const TransactionContent = ({
  children,
  verified,
}: {
  children: ReactNode;
  verified?: boolean;
}) => {
  return (
    <>
      <Heading as="h3" fontSize="size.heading.3" fontWeight="600" mb="16px">
        <FormattedMessage {...messages.operation} />
      </Heading>
      {verified ? (
        <Flex
          padding="space.m"
          alignItems="center"
          bg="background.secondary"
          borderRadius="12px"
        >
          <CheckVerified />
          <Box ml="10px" fontSize="size.body.3">
            <FormattedMessage {...messages.operationVerified} />
          </Box>
        </Flex>
      ) : (
        <Flex
          padding="16px"
          alignItems="center"
          bg="background.alert"
          borderRadius="12px"
        >
          <CheckAlert />
          <Box ml="10px" fontSize="size.body.3">
            <FormattedMessage {...messages.operationNotVerified} />
          </Box>
        </Flex>
      )}
      <Box mt="24px" wordBreak="break-all" fontSize="size.body.3">
        {children}
      </Box>
    </>
  );
};
export default TransactionContent;
