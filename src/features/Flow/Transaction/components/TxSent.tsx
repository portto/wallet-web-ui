import { useCallback } from "react";
import TransactionSent from "src/components/transaction/TransactionSent";
import { useTransactionMachine } from "src/machines/transaction";

const TxSent = () => {
  const { context, send } = useTransactionMachine();
  const { blockchain } = context.dapp;

  const handleClose = useCallback(() => send("next"), [send]);

  return <TransactionSent blockchain={blockchain} onClose={handleClose} />;
};

export default TxSent;
