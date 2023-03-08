import { assign, createMachine } from "xstate";
import { AccountAsset, Chains, TransactionFeeOption } from "src/types";

const defaultContext = {
  dapp: {
    blockchain: Chains.flow,
  },
  user: {},
  transaction: {},
};

export const machineStates = {
  IDLE: "idle",
  CONNECTING: "connecting",
  DANGEROUS: "dangerous",
  MAIN: "main",
  NON_CUSTODIAL: "nonCustodial",
  TX_SENT: "txSent",
  FINISH_PROCESS: "finishProcess",
  MAINTENANCE: "maintenance",
  ERROR: "error",
  CLOSE: "close",
  FINAL: "final",
};

export interface TransactionMachineContext {
  error?: unknown;
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
    points?: number;
    assets?: AccountAsset[];
    balance?: number;
    address?: string;
  };
  transaction: {
    rawObject?: any;
    txHash?: string;
    failReason?: string;
    fee?: number;
    feeType?: string;
    discount?: number;
    txFeeOptions?: TransactionFeeOption[];
    mayFail?: boolean;
    error?: string;
  };
  requestId?: string;
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
            target: machineStates.TX_SENT,
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
      [machineStates.TX_SENT]: {
        on: {
          next: machineStates.FINISH_PROCESS,
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
