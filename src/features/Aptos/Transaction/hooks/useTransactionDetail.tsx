import { useMemo } from "react";
import { useTransactionMachine } from "src/machines/transaction";
import { AccountAsset, AptosTransaction } from "src/types";

const TOKEN_NAME = "APT";
const APTOS_MAX_DIGITS = 100000000;

export default function useTransactionDetail(transaction: AptosTransaction) {
  const {
    context: { user },
  } = useTransactionMachine();

  const { arguments: args = [], function: functionName = "" } =
    transaction || {};
  const aptosTokenAsset = user.assets?.find(
    (asset: AccountAsset) => asset.type === "native" && asset.name === "Aptos"
  );

  const usdPrice = parseFloat(aptosTokenAsset?.usd_price ?? "0");

  return useMemo(() => {
    // @todo: support other types of txs that has coin value
    const hasValue = functionName === "0x1::coin::transfer";
    const cost = hasValue ? parseFloat(args[1]) : 0;

    return {
      hasValue,
      hasEnoughBalance: (user.balance || 0) > cost,
      ...(hasValue && {
        tokenBalance: (user?.balance || 0) / APTOS_MAX_DIGITS,
        tokenName: TOKEN_NAME,
        tokenAmount: `${(cost * 1e-8)
          .toFixed(8)
          .replace(/([0-9]+(\.[0-9]+[1-9])?)(\.?0+$)/, "$1")} ${TOKEN_NAME}`,
        usdValue: (usdPrice * cost * 1e-8).toFixed(2),
      }),
    };
  }, [args, functionName, usdPrice, user.balance]);
}
