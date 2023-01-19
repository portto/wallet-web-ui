import { Box, Text } from "@chakra-ui/react";
import React, {
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { FormattedMessage } from "react-intl";
import measureTextWidth from "src/utils/measureTextWidth";
import messages from "../features/EVM/Transaction/components/messages";

interface TransactionDetail {
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
  const { usdValue = "", tokenAmount = "" } = transactionDetail || {};
  const [showTokenAmount, setShowTokenAmount] = useState(false);
  const [urlFontSize, setUrlFontSize] = useState(0);
  const [tokenFontSize, setTokenFontSize] = useState(0);

  const tokenAmountRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const getFitFontSize = useCallback((text: string, maxFontSize = 36) => {
    if (!rootRef.current) return 0;

    const textWidth = measureTextWidth(text, `${maxFontSize}px 'Work Sans'`);
    const rootWidth = rootRef.current?.clientWidth || 0;

    // 40 is the horizontal padding.
    const elementScaleValue = (
      ((rootWidth - 40) / textWidth) *
      maxFontSize
    ).toFixed(2);

    const MIN_FONT_SIZE = 16;
    const scaledFontSize = Math.min(
      Math.max(MIN_FONT_SIZE, +elementScaleValue),
      maxFontSize
    );

    return scaledFontSize;
  }, []);

  useEffect(() => {
    setUrlFontSize(getFitFontSize(host, 16));
    setTokenFontSize(getFitFontSize(tokenAmount, 28));

    if (!transactionDetail) return;

    setShowTokenAmount(true);
  }, [transactionDetail, getFitFontSize, host, setTokenFontSize, tokenAmount]);

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
        fontSize={`${urlFontSize}px`}
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
            fontSize={`${tokenFontSize}px`}
            lineHeight="line.height.heading.2"
          >
            {showTokenAmount && `${tokenAmount}`}
          </Box>
          {showTokenAmount && (
            <Box color="font.secondary">≈ {usdValue} USD</Box>
          )}
        </>
      )}
    </Box>
  );
};
export default TransactionInfo;
