import {
  Box,
  Flex,
  HStack,
  Heading,
  Image,
  Link,
  ListItem,
  UnorderedList,
  VStack,
} from "@chakra-ui/react";
import { ReactNode, useContext } from "react";
import Logo from "src/assets/images/icons/logo.svg";
import { ReactComponent as PointWithMobile } from "src/assets/images/icons/point-with-mobile.svg";
import { FieldContext } from "src/context/field";
import { useTransactionMachine } from "src/machines/transaction";
import { AccountAsset, TransactionFeeOption } from "src/types";
import FormattedMessage from "../FormattedMessage";
import { FeeData } from "./TransactionFeeField";

interface ExtendedTransactionFeeOption extends TransactionFeeOption {
  logo: string;
  userBalance: number;
  feeAmount: number;
}

const getFeeOptionsFromAssets = (
  txFeeOptions: TransactionFeeOption[],
  assets: AccountAsset[],
  points: number
): ExtendedTransactionFeeOption[] => {
  const accountAssetsBySymbol = assets.reduce((acc, asset) => {
    acc[asset.symbol] = asset;
    return acc;
  }, {} as { [symbol: string]: AccountAsset });

  const feeWithPoint = txFeeOptions.find(
    (feeOption) => feeOption.type === "point"
  );

  const feeWithoutPoints = txFeeOptions.filter(
    (feeOption) => feeOption.type !== "point"
  );

  // sort by the first char of symbol
  feeWithoutPoints.sort((a, b) => {
    return a.symbol.charAt(0) > b.symbol.charAt(0) ? 1 : -1;
  });

  const modifiedFeePointOption = feeWithPoint
    ? [
        {
          logo: Logo,
          userBalance: points,
          feeAmount:
            (parseFloat(feeWithPoint.cost) -
              parseFloat(feeWithPoint.discount)) /
            10 ** feeWithPoint.decimals,
          ...feeWithPoint,
        },
      ]
    : [];

  return [
    ...modifiedFeePointOption,
    ...feeWithoutPoints.map((feeOption) => {
      const userAsset = accountAssetsBySymbol[feeOption.symbol];

      return {
        logo: userAsset.color_icon,
        userBalance:
          parseFloat(userAsset.value) / 10 ** userAsset.decimals || 0,
        feeAmount:
          (parseFloat(feeOption.cost) - parseFloat(feeOption.discount)) /
          10 ** feeOption.decimals,
        ...feeOption,
      };
    }),
  ];
};

const FeeOptions = ({
  setFeeData,
}: {
  setFeeData: (feeOption: FeeData) => void;
}) => {
  const { context } = useTransactionMachine();
  const { transaction, user } = context;
  const { assets = [], points = 0 } = user;
  const { txFeeOptions = [] } = transaction;
  const { closeHidableInfo } = useContext(FieldContext);
  const txFeeOptionsWithLogo = getFeeOptionsFromAssets(
    txFeeOptions,
    assets,
    points
  );

  const onOptionClick = (feeOption: ExtendedTransactionFeeOption) => () => {
    setFeeData({
      fee: parseFloat(feeOption.cost || "0"),
      discount: parseFloat(feeOption.discount || "0"),
      logo: feeOption.logo,
      type: feeOption.type,
      decimals: feeOption.decimals,
      symbol: feeOption.symbol,
    });
    closeHidableInfo();
  };

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
        {txFeeOptionsWithLogo.map((feeOption) => {
          const { logo, type, feeAmount, symbol, userBalance } = feeOption;
          return (
            <ListItem
              onClick={onOptionClick(feeOption)}
              key={symbol}
              cursor={feeAmount > userBalance ? "default" : "pointer"}
            >
              <HStack
                py="space.2xs"
                my="space.2xs"
                px="space.xs"
                borderRadius="12px"
                transition=".2s background"
                className="feeOptionPanel"
                _hover={{
                  ...(feeAmount > userBalance
                    ? {}
                    : { bg: { md: "background.tertiary" } }),
                }}
              >
                <Flex
                  borderRadius="50%"
                  bg="background.secondary"
                  width="48px"
                  height="48px"
                  justify="center"
                  align="center"
                  transition=".2s background"
                  sx={{
                    ".feeOptionPanel:hover &": {
                      ...(feeAmount > userBalance
                        ? {}
                        : { bg: { md: "white" } }),
                    },
                  }}
                >
                  <Image src={logo} width="30px" height="30px" />
                </Flex>
                <VStack flex={1} align="start">
                  {type === "point" ? (
                    <>
                      <Box
                        fontWeight="weight.m"
                        lineHeight="line.height.subheading.2"
                        fontSize="size.body.2"
                        color={
                          feeAmount > userBalance
                            ? "font.alert"
                            : "font.primary"
                        }
                      >
                        <FormattedMessage
                          intlKey="app.authz.transactionFeePoints"
                          values={{ points: feeAmount }}
                        />
                      </Box>
                      <Box color="font.secondary">
                        <FormattedMessage
                          intlKey="app.authz.transactionFeePoints"
                          values={{ points: userBalance }}
                        />
                      </Box>
                    </>
                  ) : (
                    <>
                      <Box
                        fontWeight="weight.m"
                        lineHeight="line.height.subheading.2"
                        fontSize="size.body.2"
                        color={
                          feeAmount > userBalance
                            ? "font.alert"
                            : "font.primary"
                        }
                      >
                        {`${feeAmount} ${symbol}`}
                      </Box>
                      <Box color="font.secondary">{`${userBalance} ${symbol}`}</Box>
                    </>
                  )}
                </VStack>
                {type === "point" && (
                  <Box
                    py="space.s"
                    px="space.m"
                    borderRadius="100px"
                    fontWeight={500}
                    color="white"
                    bg="interaction.primary"
                    cursor="pointer"
                  >
                    <FormattedMessage intlKey="app.general.buy" />
                  </Box>
                )}
              </HStack>
            </ListItem>
          );
        })}
      </UnorderedList>
    </>
  );
};

export default FeeOptions;
