import { assign, createMachine } from "xstate";
import { Chains } from "src/types";

const defaultContext = {
  dapp: {
    blockchain: Chains.flow,
  },
  user: {
    onApprove: () => undefined,
    onReject: () => undefined,
  },
  message: {},
};

export const machineStates = {
  IDLE: "idle",
  CONNECTING: "connecting",
  MAIN: "main",
  NON_CUSTODIAL: "nonCustodial",
  FINISH_PROCESS: "finishProcess",
  MAINTENANCE: "maintenance",
  ERROR: "error",
  CLOSE: "close",
  FINAL: "final",
};

export interface SigningMachineContext {
  error?: any;
  dapp: {
    id?: string;
    name?: string;
    logo?: string;
    blockchain: Chains;
    chainLogo?: string;
    url?: string;
  };
  user: {
    type?: string;
    sessionId?: string;
    onApprove: (arg: any) => void;
    onReject: (arg: any) => void;
  };
  signatureId?: string;
  message: {
    // raw message input
    raw?: string;
    // converted message to besigned
    toBeSigned?: string;
    signature?: string | string[];
    // for aptos signature
    bitmap?: string;
    // any other things need to be stored
    meta?: any;
    error?: any;
  };
}

const machine = createMachine<SigningMachineContext>(
  {
    id: "signing",
    initial: machineStates.IDLE,
    predictableActionArguments: true,
    context: defaultContext,
    // default trigger actions
    on: {
      updateState: { actions: "updateState" },
      updateDapp: { actions: "updateDapp" },
      updateUser: { actions: "updateUser" },
      updateMessage: { actions: "updateMessage" },
      serviceInvalid: machineStates.MAINTENANCE,
      close: machineStates.CLOSE,
      error: { target: machineStates.ERROR, actions: "setError" },
    },
    states: {
      [machineStates.IDLE]: {
        on: {
          init: { target: machineStates.CONNECTING, actions: "updateState" },
        },
        tags: ["System"],
      },
      [machineStates.CONNECTING]: {
        on: {
          ready: {
            target: machineStates.MAIN,
            actions: "updateUserAndMessage",
          },
          nonCustodial: {
            target: machineStates.NON_CUSTODIAL,
            actions: "updateUserAndMessage",
          },
        },
      },
      [machineStates.MAIN]: {
        on: {
          reject: { target: machineStates.CLOSE, actions: "updateMessage" },
          approve: {
            target: machineStates.FINISH_PROCESS,
            actions: "updateUserAndMessage",
          },
        },
      },
      [machineStates.NON_CUSTODIAL]: {
        on: {
          reject: { target: machineStates.CLOSE, actions: "updateMessage" },
          approve: {
            target: machineStates.FINISH_PROCESS,
            actions: "updateMessage",
          },
        },
      },
      [machineStates.FINISH_PROCESS]: {
        invoke: { src: "finish", onDone: machineStates.FINAL },
        tags: ["System"],
      },
      [machineStates.MAINTENANCE]: {},
      [machineStates.ERROR]: {},
      [machineStates.CLOSE]: {
        invoke: { src: "abort", onDone: machineStates.FINAL },
        tags: ["System"],
      },
      [machineStates.FINAL]: {
        tags: ["System"],
      },
    },
  },
  {
    actions: {
      updateState: assign((_, event) => event.data),
      updateUserAndMessage: assign({
        user: (context, event) => ({ ...context.user, ...event.data.user }),
        message: (context, event) => ({
          ...context.message,
          ...event.data.message,
        }),
      }),
      updateDapp: assign({
        dapp: (context, event) => ({ ...context.dapp, ...event.data }),
      }),
      updateUser: assign({
        user: (context, event) => ({ ...context.user, ...event.data }),
      }),
      updateMessage: assign({
        message: (context, event) => ({
          ...context.message,
          ...event.data,
        }),
      }),
    },
  }
);

export default machine;
