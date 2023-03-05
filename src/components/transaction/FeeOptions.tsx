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
import { ReactNode } from "react";
import Logo from "src/assets/images/icons/logo.svg";
import { ReactComponent as PointWithMobile } from "src/assets/images/icons/point-with-mobile.svg";
import { useTransactionMachine } from "src/machines/transaction";
import { AccountAsset, TransactionFeeOption } from "src/types";
import FormattedMessage from "../FormattedMessage";

const getFeeOptionsFromAssets = (
  txFeeOptions: TransactionFeeOption[],
  assets: AccountAsset[],
  points: number
) => {
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

const FeeOptions = () => {
  const { context } = useTransactionMachine();
  const { transaction, user } = context;
  const { assets = [], points = 0 } = user;
  const { txFeeOptions = [] } = transaction;
  const txFeeOptionsWithLogo = getFeeOptionsFromAssets(
    txFeeOptions,
    assets,
    points
  );

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
        {txFeeOptionsWithLogo.map(
          ({ logo, type, feeAmount, symbol, userBalance }) => (
            <ListItem py="space.m" key={symbol}>
              <HStack>
                <Flex
                  borderRadius="50%"
                  bg="background.secondary"
                  width="48px"
                  height="48px"
                  justify="center"
                  align="center"
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
                    _hover={{
                      bg: { md: "interaction.primary.hovered" },
                      transform: "scale(0.98)",
                    }}
                    _active={{
                      bg: "interaction.secondary.pressed",
                      transform: "scale(0.96)",
                    }}
                    _disabled={{
                      bg: "interaction.secondary.disabled",
                      cursor: "not-allowed",
                    }}
                  >
                    <FormattedMessage intlKey="app.general.buy" />
                  </Box>
                )}
              </HStack>
            </ListItem>
          )
        )}
      </UnorderedList>
    </>
  );
};

export default FeeOptions;
