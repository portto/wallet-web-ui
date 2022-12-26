import { useInterpret } from "@xstate/react";
import React, { createContext } from "react";
import { InterpreterFrom } from "xstate";
import machine from "./definition";
import * as services from "./services";

export const SigningContext = createContext({
  actor: {} as InterpreterFrom<typeof machine>,
});

export const withSigningContext =
  (Component: React.ComponentType) => (props: any) => {
    const actor = useInterpret(machine, { services });
    return (
      <SigningContext.Provider value={{ actor }}>
        <Component {...props} />
      </SigningContext.Provider>
    );
  };
