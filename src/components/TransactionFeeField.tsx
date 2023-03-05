import { Box, Flex, HStack, Spinner } from "@chakra-ui/react";
import { ReactComponent as Logo } from "src/assets/images/icons/logo.svg";
import Field from "src/components/Field";
import FormattedMessage from "src/components/FormattedMessage";
import FeeOptions from "src/components/transaction/FeeOptions";

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
      hidableInfo={<FeeOptions />}
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
