import React, { createContext } from "react";
import { useInterpret } from "@xstate/react";
import machine from "./definition";
import * as services from "./services";
import { InterpreterFrom } from "xstate";

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
