import React, { createContext } from "react";
import { useInterpret } from "@xstate/react";
import machine from "./definition";
import * as services from "./services";
import { InterpreterFrom } from "xstate";

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
