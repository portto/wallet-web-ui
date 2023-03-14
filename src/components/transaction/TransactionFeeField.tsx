import { Box, Flex, HStack, Image, Spinner } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import logo from "src/assets/images/icons/logo.svg";
import Field from "src/components/Field";
import FormattedMessage from "src/components/FormattedMessage";
import FeeOptions from "src/components/transaction/FeeOptions";
import { useTransactionMachine } from "src/machines/transaction";

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
        <Image src={logo} />
      </Flex>
      <Box>
        <FormattedMessage intlKey="app.authz.free" />
      </Box>
    </HStack>
  </Field>
);

export interface FeeData {
  fee?: number;
  discount?: number;
  logo?: string;
  symbol?: string;
  type: string;
  decimals: number;
}

const isNumber = (value: any) => typeof value === "number";

const TransactionFeeField = ({ isFree = false }: { isFree?: boolean }) => {
  const { context } = useTransactionMachine();
  const { transaction, user } = context;
  const { points = 0 } = user;
  const { fee: feeInPoint, discount: discountInPoint } = transaction;

  const [feeData, setFeeData] = useState<FeeData>({
    logo: "",
    type: "point",
    decimals: 0,
    symbol: "",
  });

  useEffect(() => {
    if (isNumber(feeData.fee)) return;
    setFeeData({
      fee: feeInPoint,
      discount: discountInPoint,
      logo,
      type: "point",
      decimals: 0,
    });
  }, [feeInPoint, discountInPoint, feeData.fee]);

  const isLoading = !isNumber(feeData.fee);
  const hasDiscount = (feeData?.discount ?? 0) > 0;
  const realTransactionFee = hasDiscount
    ? (feeData.fee ?? 0) - (feeData.discount ?? 0)
    : feeData.fee ?? 0;

  const insufficientPoint =
    feeData.type === "point" && realTransactionFee > points;

  if (isFree) {
    return <FreeTransactionFeeField />;
  }

  return (
    <Field
      title={<FormattedMessage intlKey="app.authz.transactionFee" />}
      hidableInfo={
        <FeeOptions
          setFeeData={setFeeData}
          insufficientPoint={insufficientPoint}
        />
      }
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
              <Image src={feeData.logo} />
            </Flex>
            <Box color={insufficientPoint ? "font.alert" : "font.primary"}>
              {feeData.type === "point" ? (
                <>
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
                          values={{ points: feeData.fee }}
                        />
                      </Box>
                      )
                    </Box>
                  )}
                  {insufficientPoint && (
                    <>
                      {` (`}
                      <FormattedMessage intlKey="app.authz.insufficientAmount" />
                      {`)`}
                    </>
                  )}
                </>
              ) : (
                <>
                  <Box>{`${realTransactionFee / 10 ** feeData.decimals} ${
                    feeData.symbol
                  }`}</Box>
                  {hasDiscount && (
                    <Box as="span" pl="space.3xs">
                      (
                      <Box as="del">
                        {`${(feeData.fee ?? 0) / 10 ** feeData.decimals} ${
                          feeData.symbol
                        }`}
                      </Box>
                      )
                    </Box>
                  )}
                </>
              )}
            </Box>
          </>
        )}
      </HStack>
    </Field>
  );
};
export default TransactionFeeField;
