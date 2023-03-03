import {
  Box,
  Flex,
  HStack,
  Heading,
  Link,
  ListItem,
  Spinner,
  UnorderedList,
} from "@chakra-ui/react";
import { ReactNode } from "react";
import { ReactComponent as Logo } from "src/assets/images/icons/logo.svg";
import { ReactComponent as PointWithMobile } from "src/assets/images/icons/point-with-mobile.svg";
import Field from "src/components/Field";
import FormattedMessage from "src/components/FormattedMessage";
import { useTransactionMachine } from "src/machines/transaction";

const FeeList = () => {
  const { context } = useTransactionMachine();
  const { transaction } = context;
  const { txFeeOptions } = transaction;
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

const FreeTransactionFeeField = () => (
  <Field title={<FormattedMessage intlKey="app.authz.transactionFee" />}>
    <HStack>
      <Flex
        bg="background.secondary"
        borderRadius="50%"
        width="20px"
        height="20px"
        justifyContent="center"
        alignItems="center"
        p="space.4xs"
      >
        <Logo />
      </Flex>
      <Box>
        <FormattedMessage intlKey="app.authz.free" />
      </Box>
    </HStack>
  </Field>
);

const TransactionFeeField = ({
  originalTransactionFee = 0,
  discount = 0,
  isFree = false,
}: {
  discount?: number;
  originalTransactionFee?: number;
  isFree?: boolean;
}) => {
  const isLoading = !originalTransactionFee;
  const hasDiscount = (discount || 0) > 0;
  const realTransactionFee = hasDiscount
    ? originalTransactionFee - discount
    : originalTransactionFee;

  if (isFree) {
    return <FreeTransactionFeeField />;
  }

  return (
    <Field
      title={<FormattedMessage intlKey="app.authz.transactionFee" />}
      hidableInfo={<FeeList />}
    >
      <HStack>
        {isLoading && (
          <Spinner width="15px" height="15px" color="icon.tertiary" />
        )}
        {!isLoading && (
          <>
            <Flex
              bg="background.secondary"
              borderRadius="50%"
              width="20px"
              height="20px"
              justifyContent="center"
              alignItems="center"
              mr="space.3xs"
              p="space.4xs"
            >
              <Logo />
            </Flex>
            <Box>
              <FormattedMessage
                intlKey="app.authz.transactionFeePoints"
                values={{ points: realTransactionFee }}
              />
              {hasDiscount && (
                <Box as="span" pl="space.3xs">
                  (
                  <Box as="del">
                    <FormattedMessage
                      intlKey="app.authz.transactionFeePoints"
                      values={{ points: originalTransactionFee }}
                    />
                  </Box>
                  )
                </Box>
              )}
            </Box>
          </>
        )}
      </HStack>
    </Field>
  );
};
export default TransactionFeeField;
