import { useMemo } from "react";
import { useTransactionMachine } from "src/machines/transaction";
import { AccountAsset, AptosTransaction } from "src/types";

const TOKEN_NAME = "APT";
export default function useTransactionDetail(transaction: AptosTransaction) {
  const {
    context: { user },
  } = useTransactionMachine();

  const { arguments: args = [], function: functionName = "" } =
    transaction || {};

  const { usd_price: usdPrice } = user.assets?.find(
    (asset: AccountAsset) => asset.type === "native"
  );

  return useMemo(() => {
    // @todo: support other types of txs that has coin value
    const hasValue = functionName === "0x1::coin::transfer";
    const cost = hasValue ? parseFloat(args[1]) : 0;

    return {
      hasValue,
      hasEnoughBalance: (user.balance || 0) > cost,
      ...(hasValue && {
        tokenBalance: user.balance,
        tokenName: TOKEN_NAME,
        tokenAmount: `${(cost * 1e-8)
          .toFixed(8)
          .replace(/([0-9]+(\.[0-9]+[1-9])?)(\.?0+$)/, "$1")} ${TOKEN_NAME}`,
        usdValue: (usdPrice * cost * 1e-8).toFixed(2),
      }),
    };
  }, [args, functionName, usdPrice, user.balance]);
}
