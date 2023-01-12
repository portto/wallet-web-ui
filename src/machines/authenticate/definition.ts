import merge from "lodash.merge";
import { assign, createMachine } from "xstate";
import { Chains } from "src/utils/constants";

const defaultContext = {
  dapp: {
    blockchain: Chains.flow,
  },
  user: {
    onConfirm: () => undefined,
    onReject: () => undefined,
  },
};

export const machineStates = {
  IDLE: "idle",
  CONNECTING: "connecting",
  QUEUEING: "queueing",
  INPUT_EMAIL: "inputEmail",
  INPUT_OTP: "inputOTP",
  INPUT_2FA: "input2FA",
  SET_CREDENTIALS: "setCredentials",
  VERIFY_USER: "systemProcessing",
  ENABLE_BLOCKCHAIN: "enableBlockchain",
  ACCOUNT_CONFIRM: "accountConfirm",
  RUN_INIT_SCRIPTS: "runInitScripts",
  RESET_AUTH: "resetAuth",
  FINISH_PROCESS: "finishProcess",
  MAINTENANCE: "maintenance",
  ERROR: "error",
  CLOSE: "close",
  FINAL: "final",
};

export interface AuthenticateMachineContext {
  isThroughBackChannel?: boolean;
  blockchainIcon?: string;
  error?: unknown;
  queue?: {
    queueId: number;
    readyNumber: number;
    queueNumber: number;
    time: number;
  };
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
    authCodeId?: string;
    authCode?: string;
    authenticationId?: string;
    accessToken?: string;
    deviceKey?: string;
    action?: "register" | "login";
    nonce?: string;
    points?: number;
    addresses?: {
      [key in string]: string;
    };
    accountInfo?: {
      code: string;
      paddr: string;
    };
    signatureData?: {
      fclVersion?: string;
      appIdentifier?: string;
      appDomainTag?: string;
      nonce?: string;
      timestamp?: string;
    };
    signatures?: string[];
    onConfirm: (arg: unknown) => void;
    onReject: () => void;
  };
}

const machine = createMachine<AuthenticateMachineContext>(
  {
    id: "authenticate",
    initial: machineStates.IDLE,
    predictableActionArguments: true,
    // Deep clone to prevent modify {defaultContext}
    context: JSON.parse(JSON.stringify(defaultContext)),
    // default trigger actions
    on: {
      updateState: { actions: "updateState" },
      updateQueue: { actions: "updateQueue" },
      updateDapp: { actions: "updateDapp" },
      updateUser: { actions: "updateUser" },
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
          ready: machineStates.QUEUEING,
          skipLogin: machineStates.VERIFY_USER,
        },
      },
      [machineStates.QUEUEING]: {
        on: { ready: machineStates.INPUT_EMAIL },
      },
      [machineStates.INPUT_EMAIL]: {
        on: {
          confirm: { target: machineStates.INPUT_OTP, actions: "updateUser" },
        },
      },
      [machineStates.INPUT_OTP]: {
        on: {
          renewOTPCode: {
            target: machineStates.INPUT_OTP,
            actions: "updateUser",
          },
          next: {
            target: machineStates.SET_CREDENTIALS,
            actions: "updateUser",
          },
          require2fa: {
            target: machineStates.INPUT_2FA,
            actions: "updateUser",
          },
          back: machineStates.RESET_AUTH,
        },
      },
      [machineStates.INPUT_2FA]: {
        on: {
          next: {
            target: machineStates.SET_CREDENTIALS,
            actions: "updateUser",
          },
          back: machineStates.RESET_AUTH,
        },
      },
      [machineStates.SET_CREDENTIALS]: {
        invoke: { src: "setCredentials" },
        on: {
          verifyUser: machineStates.VERIFY_USER,
        },
        tags: ["System"],
      },
      [machineStates.VERIFY_USER]: {
        invoke: { src: "verifyUser" },
        on: {
          invalidToken: machineStates.RESET_AUTH,
          enableBlockchain: {
            target: machineStates.ENABLE_BLOCKCHAIN,
            actions: "updateState",
          },
          accountReady: {
            target: machineStates.ACCOUNT_CONFIRM,
            actions: "updateState",
          },
        },
        tags: ["System"],
      },
      [machineStates.ENABLE_BLOCKCHAIN]: {
        on: {
          done: {
            target: machineStates.ACCOUNT_CONFIRM,
            actions: "updateUser",
          },
          switchAccount: machineStates.RESET_AUTH,
        },
      },
      [machineStates.ACCOUNT_CONFIRM]: {
        on: {
          approve: machineStates.FINISH_PROCESS,
          nonCustodialApprove: machineStates.RUN_INIT_SCRIPTS,
          switchAccount: machineStates.RESET_AUTH,
        },
      },
      [machineStates.RESET_AUTH]: {
        invoke: { src: "cleanUpLocalStorage" },
        on: {
          restart: {
            target: machineStates.INPUT_EMAIL,
            actions: "resetAuth",
          },
        },
        tags: ["System"],
      },
      [machineStates.RUN_INIT_SCRIPTS]: {
        on: { done: machineStates.FINISH_PROCESS },
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
      updateState: assign((context, event) => merge(context, event.data)),
      updateQueue: assign({
        queue: (context, event) => ({ ...context.queue, ...event.data }),
      }),
      updateDapp: assign({
        dapp: (context, event) => ({ ...context.dapp, ...event.data }),
      }),
      updateUser: assign({
        user: (context, event) => ({ ...context.user, ...event.data }),
      }),
      resetAuth: assign({ user: (_) => defaultContext.user }),
    },
  }
);

export default machine;
