import transactionsMainnet from "@blocto/flow-transactions/build/messages.mainnet.sha3.json";
import transactionsTestnet from "@blocto/flow-transactions/build/messages.testnet.sha3.json";
import { IS_LOCAL, IS_PRODUCTION, IS_STAGING } from "src/services/Env";
import { FlowTransaction } from "src/types";
import hashMsg from "src/utils/hasMsg";

// TODO: Get recognized transactions from @blocto/flow-transactions for sandboxnet
const transactions = (): { [key: string]: any } => {
  if (IS_LOCAL || IS_STAGING) return transactionsTestnet;
  if (IS_PRODUCTION) return transactionsMainnet;
  return {};
};

const recognizeTx = (transaction: FlowTransaction) => {
  // Check required fields
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
    args[recognizedTx.arguments[index]] = item.value;
  });

  return {
    ...recognizedTx,
    hash,
    args,
  };
};

export default recognizeTx;
