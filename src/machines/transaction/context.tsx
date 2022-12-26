import { useInterpret } from "@xstate/react";
import React, { createContext } from "react";
import { InterpreterFrom } from "xstate";
import machine from "./definition";
import * as services from "./services";

export const TransactionContext = createContext({
  actor: {} as InterpreterFrom<typeof machine>,
});

export const withTransactionContext =
  (Component: React.ComponentType) => (props: any) => {
    const actor = useInterpret(machine, { services });
    return (
      <TransactionContext.Provider value={{ actor }}>
        <Component {...props} />
      </TransactionContext.Provider>
    );
  };
