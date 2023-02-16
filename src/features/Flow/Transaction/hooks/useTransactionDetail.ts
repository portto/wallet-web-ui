import { useCallback, useEffect, useMemo, useState } from "react";
import { useTransactionMachine } from "src/machines/transaction";
import { recognizeTx } from "src/services/Flow";
import { AccountAsset, FlowTransaction, RecognizedFlowTx } from "src/types";
import { MoonpayCoinSymbols } from "../constants";

interface FlowAssets {
  [key: string]: AccountAsset;
}

interface RecognizedTokens {
  [key: string]: {
    tokenAmount: number;
    usdValue: number;
  };
}

const isBalanceEnough = (
  recognizedTokens: RecognizedTokens,
  flowAssets: FlowAssets
) => {
  const byPass = () => true;

  if (
    !flowAssets ||
    !recognizedTokens ||
    !Object.keys(recognizedTokens).length
  ) {
    return byPass();
  }

  const isEnough = Object.entries(recognizedTokens).every(
    ([tokenName, tokenInfo]) => {
      const tokenBalance = flowAssets[tokenName].value || 0;

      if (
        !MoonpayCoinSymbols[
          tokenName.toLowerCase() as keyof typeof MoonpayCoinSymbols
        ]
      ) {
        return byPass();
      }

      return tokenInfo.tokenAmount <= tokenBalance;
    }
  );

  return isEnough;
};

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

  const assetsList =
    user.assets?.filter(({ type }) =>
      ["flow_fungible_token", "native"].includes(type)
    ) || [];

  const flowAssets = Object.fromEntries(
    assetsList.map((asset) => [asset.symbol, asset])
  );

  const getRecognizedTokens = useCallback(() => {
    const { balances, args } = recognizedTx || {};

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
  }, [flowAssets, recognizedTx]);

  return useMemo(() => {
    const recognizedTokens = getRecognizedTokens() || {};
    const tokenValuePair =
      !!recognizedTokens && Object.entries(recognizedTokens);

    return {
      hasEnoughBalance: isBalanceEnough(recognizedTokens, flowAssets),
      tokenNames: tokenValuePair.map(([tokenName]) => tokenName),
      // use map function for displaying multiple tokens in the tx.
      tokenBalances: tokenValuePair
        .map(([tokenName]) => `${flowAssets[tokenName].value} ${tokenName}`)
        .join(" + "),
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
  }, [flowAssets, getRecognizedTokens, recognizedTx]);
}
