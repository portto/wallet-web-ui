import { Box, Text } from "@chakra-ui/react";
import React, { ReactNode } from "react";
import { FormattedMessage } from "react-intl";
import messages from "./messages";

const TransactionInfo = ({
  host,
  children,
}: {
  host: string;
  children: ReactNode;
}) => {
  return (
    <Box bg="background.secondary" textAlign="center" pb="space.xl">
      <Box>{children}</Box>
      <Text fontSize={"size.body.3"} mb="space.2xs">
        <FormattedMessage {...messages.confirmTransactionFrom} />
      </Text>
      <Text
        bg="white"
        display="inline-block"
        px="space.m"
        py="space.3xs"
        borderRadius="32px"
        fontSize="size.subheading.2"
        fontWeight="weight.m"
      >
        {host}
      </Text>
    </Box>
  );
};
export default TransactionInfo;
