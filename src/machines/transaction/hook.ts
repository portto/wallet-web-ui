import { useActor } from "@xstate/react";
import { useContext, useMemo } from "react";
import { TransactionContext } from "./context";

const useTransactionMachine = () => {
  const { actor } = useContext(TransactionContext);
  const [state] = useActor(actor);

  return useMemo(() => ({ ...state, send: actor.send }), [state, actor.send]);
};

export default useTransactionMachine;