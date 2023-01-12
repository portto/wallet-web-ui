import { Box, Text } from "@chakra-ui/react";
import React, { ReactNode, useCallback, useRef, useState } from "react";
import { FormattedMessage } from "react-intl";
import measureTextWidth from "src/utils/measureTextWidth";
import messages from "./messages";

interface TransactionDetail {
  hasEnoughBalance: boolean;
  isSupportedTokenTransfering: boolean;
  tokenName: string;
  tokenAmount: string;
  usdValue: string;
}

const TransactionInfo = ({
  host,
  children,
  transactionDetail,
}: {
  host: string;
  children: ReactNode;
  transactionDetail?: TransactionDetail;
}) => {
  const [showTokenAmount, setShowTokenAmount] = useState(false);
  const {
    usdValue = "",
    tokenName = "",
    tokenAmount = "",
  } = transactionDetail || {};
  const tokenAmountRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const getFitFontSize = useCallback((text: string, maxFontSize = 36) => {
    if (!rootRef.current) return;

    const textWidth = measureTextWidth(text, `${maxFontSize}px 'Work Sans'`);
    const rootWidth = rootRef.current?.clientWidth || 0;

    // 40 is the horizontal padding.
    const elementScaleValue = (
      ((rootWidth - 40) / textWidth) *
      maxFontSize
    ).toFixed(2);

    const scaledFontSize = Math.min(
      Math.max(16, +elementScaleValue),
      maxFontSize
    );

    return scaledFontSize;
  }, []);

  return (
    <Box
      ref={rootRef}
      bg="background.secondary"
      textAlign="center"
      pb="space.xl"
    >
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
        mb="space.2xs"
      >
        {host}
      </Text>
      {transactionDetail && (
        <>
          <Box
            ref={tokenAmountRef}
            mb="space.4xs"
            fontWeight="weight.l"
            fontSize={getFitFontSize(tokenAmount, 28)}
            lineHeight="line.height.heading.2"
          >
            {`${tokenAmount} ${tokenName}`}
          </Box>
          <Box color="font.secondary">≈ {usdValue} USD</Box>
        </>
      )}
    </Box>
  );
};
export default TransactionInfo;
