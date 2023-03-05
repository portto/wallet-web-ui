import {
  Box,
  Flex,
  Heading,
  Link,
  ListItem,
  UnorderedList,
} from "@chakra-ui/react";
import { ReactNode } from "react";
import { ReactComponent as PointWithMobile } from "src/assets/images/icons/point-with-mobile.svg";
import { useTransactionMachine } from "src/machines/transaction";
import FormattedMessage from "../FormattedMessage";

const FeeOptions = () => {
  const { context } = useTransactionMachine();
  // const { transaction } = context;
  // const { txFeeOptions } = transaction;
  const txFeeOptions = [{}];
  console.log("txFeeOptions :", txFeeOptions);
  return (
    <>
      <Heading
        as="h3"
        fontSize="size.heading.3"
        fontWeight="weight.l"
        mb="space.m"
      >
        <FormattedMessage intlKey="app.authz.transactionFee" />
      </Heading>
      <Flex
        p="space.s"
        bg="background.secondary"
        borderRadius="12px"
        flexDirection="column"
      >
        <Flex mb="space.s">
          <Box mr="space.s">
            <FormattedMessage intlKey="app.authz.purchaseBloctoPoint" />
          </Box>
          <Box ml="space.3xs">
            <PointWithMobile />
          </Box>
        </Flex>
        <Box>
          <FormattedMessage
            intlKey="app.authz.bloctoPoint"
            values={{
              a: (chunks: ReactNode) => (
                <Link
                  href="https://portto.zendesk.com/hc/en-us/articles/900005302883-What-are-Blocto-points-What-can-I-do-with-Blocto-points-"
                  isExternal
                  textDecor="underline"
                  rel="noopener noreferrer"
                  fontWeight="weight.m"
                >
                  {chunks}
                </Link>
              ),
            }}
          />
        </Box>
      </Flex>
      <UnorderedList listStyleType="none" m={0}>
        <ListItem py="space.m">xx</ListItem>
        <ListItem>xx</ListItem>
        <ListItem>xx</ListItem>
        <ListItem>xx</ListItem>
      </UnorderedList>
    </>
  );
};

export default FeeOptions;
