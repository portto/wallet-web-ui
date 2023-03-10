import transactionsMainnet from "@blocto/flow-transactions/build/messages.mainnet.sha3.json";
import transactionsTestnet from "@blocto/flow-transactions/build/messages.testnet.sha3.json";
import { IS_MAINNET, IS_SANDBOXNET, IS_TESTNET } from "src/services/Env";
import { FlowTransaction, RecognizedFlowTx } from "src/types";
import hashMsg from "src/utils/hashMsg";

// @todo: Get recognized transactions from @blocto/flow-transactions for sandboxnet
const transactions = (): {
  [id: string]: {
    arguments?: string[];
    messages: Record<string, string>;
    balances?: Record<string, string>;
  };
} => {
  if (IS_SANDBOXNET || IS_TESTNET) return transactionsTestnet;
  if (IS_MAINNET) return transactionsMainnet;
  return {};
};

export const recognizeTx = (
  transaction: FlowTransaction
): RecognizedFlowTx | null => {
  if (!transaction) {
    return null;
  }

  if (!transaction.voucher) {
    return null;
  }

  const script = transaction.voucher.cadence;

  if (!script) {
    return null;
  }

  const hash = hashMsg(script).toString("hex");
  const recognizedTxs = transactions();
  const recognizedTx = recognizedTxs[hash];

  if (!recognizedTx) {
    return null;
  }

  if (
    transaction.voucher.arguments.length !==
    (recognizedTx.arguments || []).length
  ) {
    return null;
  }

  const args: { [key: string]: string } = {};

  transaction.voucher.arguments.forEach((item, index) => {
    if (recognizedTx.arguments?.[index] != null)
      args[recognizedTx.arguments[index]] = item.value;
  });

  return {
    ...recognizedTx,
    hash,
    args,
  };
};
