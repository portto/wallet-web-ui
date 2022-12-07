import { useActor } from "@xstate/react";
import { useContext, useMemo } from "react";
import { AuthenticateContext } from "./context";

const useAuthenticateMachine = () => {
  const { actor } = useContext(AuthenticateContext);
  const [state] = useActor(actor);

  return useMemo(() => ({ ...state, send: actor.send }), [state, actor.send]);
};

export default useAuthenticateMachine;