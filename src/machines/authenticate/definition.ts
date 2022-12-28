import { assign, createMachine } from "xstate";

const defaultContext = {
  dapp: {
    blockchain: "flow",
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
  VERIFY_USER: "systemProcessing",
  ENABLE_BLOCKCHAIN: "enableBlockchain",
  ACCOUNT_CONFIRM: "accountConfirm",
  RUN_INIT_SCRIPTS: "runInitScripts",
  FINISH_PROCESS: "finishProcess",
  MAINTENANCE: "maintenance",
  ERROR: "error",
  CLOSE: "close",
  FINAL: "final",
};

export interface AuthenticateMachineContext {
  isThroughBackChannel?: boolean;
  error?: any;
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
    blockchain: string;
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
    onConfirm: (arg: any) => void;
    onReject: () => void;
  };
}

const machine = createMachine<AuthenticateMachineContext>(
  {
    id: "authenticate",
    initial: machineStates.IDLE,
    predictableActionArguments: true,
    context: defaultContext,
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
          next: { target: machineStates.VERIFY_USER, actions: "updateUser" },
          require2fa: {
            target: machineStates.INPUT_2FA,
            actions: "updateUser",
          },
          back: { target: machineStates.INPUT_EMAIL, actions: "resetAuth" },
        },
      },
      [machineStates.INPUT_2FA]: {
        on: {
          next: { target: machineStates.VERIFY_USER, actions: "updateUser" },
          back: { target: machineStates.INPUT_EMAIL, actions: "resetAuth" },
        },
      },
      [machineStates.VERIFY_USER]: {
        invoke: { src: "verifyUser" },
        on: {
          invalidToken: {
            target: machineStates.INPUT_EMAIL,
            actions: "resetAuth",
          },
          enableBlockchain: {
            target: machineStates.ENABLE_BLOCKCHAIN,
            actions: "updateUser",
          },
          accountReady: {
            target: machineStates.ACCOUNT_CONFIRM,
            actions: "updateUser",
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
        },
      },
      [machineStates.ACCOUNT_CONFIRM]: {
        on: {
          approve: machineStates.FINISH_PROCESS,
          nonCustodialApprove: machineStates.RUN_INIT_SCRIPTS,
          switchAccount: {
            target: machineStates.INPUT_EMAIL,
            actions: "resetAuth",
          },
        },
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
      updateState: assign((_, event) => event.data),
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
