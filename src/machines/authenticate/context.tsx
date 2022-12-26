import { useInterpret } from "@xstate/react";
import React, { createContext } from "react";
import { InterpreterFrom } from "xstate";
import machine from "./definition";
import * as services from "./services";

export const AuthenticateContext = createContext({
  actor: {} as InterpreterFrom<typeof machine>,
});

export const withAuthenticateContext =
  (Component: React.ComponentType) => (props: any) => {
    const actor = useInterpret(machine, { services });

    return (
      <AuthenticateContext.Provider value={{ actor }}>
        <Component {...props} />
      </AuthenticateContext.Provider>
    );
  };
