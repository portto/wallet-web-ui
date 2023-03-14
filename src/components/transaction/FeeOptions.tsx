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
import { MouseEvent, ReactNode, useContext, useState } from "react";
import Logo from "src/assets/images/icons/logo.svg";
import { ReactComponent as PointWithMobile } from "src/assets/images/icons/point-with-mobile.svg";
import DownloadApp from "src/components/DownloadApp";
import { FieldContext } from "src/context/field";
import { useTransactionMachine } from "src/machines/transaction";
import { isHandheld } from "src/services/Device";
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
  insufficientPoint,
}: {
  setFeeData: (feeOption: FeeData) => void;
  insufficientPoint: boolean;
}) => {
  const { context, send } = useTransactionMachine();
  const { transaction, user, dapp } = context;
  const { blockchain } = dapp;
  const { assets = [], points = 0 } = user;
  const { txFeeOptions = [] } = transaction;
  const { closeHidableInfo } = useContext(FieldContext);
  const [isDownloadPageShown, setIsDownloadPageShown] = useState(false);

  const toggleDownloadPage = (event?: MouseEvent) => {
    event?.stopPropagation();
    setIsDownloadPageShown((prev) => !prev);
  };

  const txFeeOptionsWithLogo = getFeeOptionsFromAssets(
    txFeeOptions,
    assets,
    points
  );

  const onBuyClick = (event: MouseEvent) => {
    if (isHandheld) {
      window.open("https://blocto.app.link/download");
    } else {
      toggleDownloadPage(event);
    }
  };

  const onOptionClick = (feeOption: ExtendedTransactionFeeOption) => () => {
    const fee = parseFloat(feeOption.cost || "0");
    const discount = parseFloat(feeOption.discount || "0");
    setFeeData({
      fee,
      discount,
      logo: feeOption.logo,
      type: feeOption.type,
      decimals: feeOption.decimals,
      symbol: feeOption.symbol,
    });
    send({
      type: "updateTransaction",
      data: {
        feeType: feeOption.type,
        fee,
        discount,
      },
    });
    closeHidableInfo();
  };

  return (
    <Flex direction="column" overflow="hidden" px="space.l" py="space.m">
      <Heading
        as="h3"
        fontSize="size.heading.3"
        fontWeight="weight.l"
        mb="space.m"
      >
        <FormattedMessage intlKey="app.authz.transactionFee" />
      </Heading>
      {insufficientPoint && (
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
      )}
      <UnorderedList listStyleType="none" m={0} overflowY="auto" mt="space.l">
        {txFeeOptionsWithLogo.map((feeOption) => {
          const { logo, type, feeAmount, symbol, userBalance } = feeOption;
          return (
            <ListItem
              key={symbol}
              cursor={userBalance > feeAmount ? "pointer" : "default"}
              {...(userBalance > feeAmount && {
                onClick: onOptionClick(feeOption),
              })}
            >
              <HStack
                py="space.2xs"
                my="space.2xs"
                px="space.xs"
                borderRadius="12px"
                transition=".2s background"
                className="feeOptionPanel"
                _hover={{
                  ...(userBalance > feeAmount
                    ? { bg: { md: "background.tertiary" } }
                    : {}),
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
                      ...(userBalance > feeAmount
                        ? { bg: { md: "white" } }
                        : {}),
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
                {type === "point" && insufficientPoint && (
                  <Box
                    py="space.s"
                    px="space.m"
                    borderRadius="100px"
                    fontWeight={500}
                    color="white"
                    bg="interaction.primary"
                    cursor="pointer"
                    onClick={onBuyClick}
                  >
                    <FormattedMessage intlKey="app.general.buy" />
                  </Box>
                )}
              </HStack>
            </ListItem>
          );
        })}
      </UnorderedList>
      <DownloadApp
        isShown={isDownloadPageShown}
        blockchain={blockchain}
        onLastStepClick={toggleDownloadPage}
        actionKey="app.general.buyBloctoPoint"
        actionDescriptionKey="app.general.buyBloctoPoint.description"
      />
    </Flex>
  );
};

export default FeeOptions;
