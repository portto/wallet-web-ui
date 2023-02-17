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
  transaction: {},
};

export const machineStates = {
  IDLE: "idle",
  CONNECTING: "connecting",
  DANGEROUS: "dangerous",
  MAIN: "main",
  NON_CUSTODIAL: "nonCustodial",
  FINISH_PROCESS: "finishProcess",
  MAINTENANCE: "maintenance",
  ERROR: "error",
  CLOSE: "close",
  FINAL: "final",
};

export interface TransactionMachineContext {
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
    id?: string;
    email?: string;
    type?: string;
    authorizationId?: string;
    sessionId?: string;
    points?: number;
    assets?: any[];
    balance?: number;
    address?: string;
    onApprove: (arg: any) => void;
    onReject: (arg: any) => void;
  };
  transaction: {
    rawObject?: any;
    txHash?: string;
    failReason?: string;
    fee?: number;
    discount?: number;
    mayFail?: boolean;
    error?: string;
  };
}

const machine = createMachine<TransactionMachineContext>(
  {
    id: "transaction",
    initial: machineStates.IDLE,
    predictableActionArguments: true,
    context: defaultContext,
    // default trigger actions
    on: {
      updateState: { actions: "updateState" },
      updateDapp: { actions: "updateDapp" },
      updateUser: { actions: "updateUser" },
      updateTransaction: { actions: "updateTransaction" },
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
          ready: { target: machineStates.MAIN, actions: "updateUserAndTx" },
          nonCustodial: {
            target: machineStates.NON_CUSTODIAL,
            actions: "updateUserAndTx",
          },
          reject: { target: machineStates.CLOSE, actions: "updateTransaction" },
        },
      },
      [machineStates.DANGEROUS]: {
        on: {
          reject: { target: machineStates.CLOSE },
        },
      },
      [machineStates.MAIN]: {
        on: {
          reject: { target: machineStates.CLOSE, actions: "updateTransaction" },
          approve: {
            target: machineStates.FINISH_PROCESS,
            actions: "updateTransaction",
          },
          dangerousTx: machineStates.DANGEROUS,
        },
      },
      [machineStates.NON_CUSTODIAL]: {
        on: {
          reject: { target: machineStates.CLOSE, actions: "updateTransaction" },
          approve: {
            target: machineStates.FINISH_PROCESS,
            actions: "updateTransaction",
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
      updateUserAndTx: assign({
        user: (context, event) => ({ ...context.user, ...event.data.user }),
        transaction: (context, event) => ({
          ...context.transaction,
          ...event.data.transaction,
        }),
      }),
      updateDapp: assign({
        dapp: (context, event) => ({ ...context.dapp, ...event.data }),
      }),
      updateUser: assign({
        user: (context, event) => ({ ...context.user, ...event.data }),
      }),
      updateTransaction: assign({
        transaction: (context, event) => ({
          ...context.transaction,
          ...event.data,
        }),
      }),
      resetAuth: assign({ user: (_) => defaultContext.user }),
    },
  }
);

export default machine;
