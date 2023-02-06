import { useCallback, useEffect, useMemo, useState } from "react";
import { useTransactionMachine } from "src/machines/transaction";
import { recognizeTx } from "src/services/Flow";
import { FlowTransaction, RecognizedFlowTx } from "src/types";

export default function useTransactionDetail(transaction: FlowTransaction) {
  const [recognizedTx, setRecognizedTx] = useState<RecognizedFlowTx | null>(
    null
  );

  useEffect(() => {
    const result = recognizeTx(transaction);
    if (!result) return;
    setRecognizedTx(result);
  }, [transaction]);

  const {
    context: { user },
  } = useTransactionMachine();

  const getRecognizedTokens = useCallback(() => {
    const { balances, args } = recognizedTx || {};

    const assetsList =
      user.assets?.filter(({ type }) =>
        ["flow_fungible_token", "native"].includes(type)
      ) || [];

    const flowAssets = Object.fromEntries(
      assetsList.map((asset) => [asset.symbol, asset])
    );

    if (!balances || !args || !flowAssets) return null;

    return Object.entries(balances).reduce((acc, [argName, tokenName]) => {
      const rawUSDPrice = flowAssets[tokenName]?.usd_price || 0;
      const tokenAmount = parseFloat(args[argName]) || 0;
      const usdValue = (parseFloat(rawUSDPrice) * tokenAmount).toFixed(2);

      acc[tokenName] = {
        tokenAmount,
        usdValue: +usdValue,
      };
      return acc;
    }, {} as { [key: string]: { tokenAmount: number; usdValue: number } });
  }, [recognizedTx, user.assets]);

  return useMemo(() => {
    const recognizedTokens = getRecognizedTokens() || {};
    const tokenValuePair =
      !!recognizedTokens && Object.entries(recognizedTokens);

    return {
      // @todo: add balance checking logic.
      // hasEnoughBalance: true,
      tokenNames: tokenValuePair.map(([tokenName]) => tokenName),
      // for displaying multiple tokens in the tx.
      tokenAmount: tokenValuePair
        .map(
          ([tokenName, tokenInfo]) => `${tokenInfo.tokenAmount} ${tokenName}`
        )
        .join(" + "),
      usdValue: `${tokenValuePair.reduce(
        (acc, [, tokenInfo]) => acc + tokenInfo.usdValue,
        0
      )}`,
      recognizedTx,
    };
  }, [getRecognizedTokens, recognizedTx]);
}
