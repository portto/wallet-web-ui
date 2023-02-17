import { memo, useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { getMaintenanceStatus } from "src/apis";
import { useLayoutContext } from "src/context/layout";
import {
  machineStates,
  useAuthenticateMachine,
  withAuthenticateContext,
} from "src/machines/authenticate";
import { FCL_EVENTS, onReady } from "src/services/Frame";
import {
  KEY_ACCESS_TOKEN,
  KEY_DEVICE_ID,
  KEY_DEVICE_KEY,
  KEY_EMAIL,
  KEY_USER_ID,
  KEY_USER_TYPE,
  getItem,
} from "src/services/LocalStorage";

import AccountConfirm from "./components/AccountConfirm";
import Connecting from "./components/Connecting";
import EnableBlockchain from "./components/EnableBlockchain";
import Input2FA from "./components/Input2FA";
import InputEmail from "./components/InputEmail";
import InputOTP from "./components/InputOTP";
import Maintenance from "./components/Maintenance";
import Queueing from "./components/Queueing";

const systemStatus = [
  machineStates.IDLE,
  machineStates.SET_CREDENTIALS,
  machineStates.VERIFY_USER,
  machineStates.RESET_AUTH,
  machineStates.FINISH_PROCESS,
  machineStates.CLOSE,
  machineStates.FINAL,
];

const stageComponentMapping: Record<
  string,
  { component: () => JSX.Element; layoutSize: "sm" | "lg" }
> = {
  [machineStates.CONNECTING]: { component: Connecting, layoutSize: "sm" },
  [machineStates.QUEUEING]: { component: Queueing, layoutSize: "sm" },
  [machineStates.INPUT_EMAIL]: { component: InputEmail, layoutSize: "sm" },
  [machineStates.INPUT_OTP]: { component: InputOTP, layoutSize: "sm" },
  [machineStates.INPUT_2FA]: { component: Input2FA, layoutSize: "sm" },
  [machineStates.ENABLE_BLOCKCHAIN]: {
    component: EnableBlockchain,
    layoutSize: "sm",
  },
  [machineStates.ACCOUNT_CONFIRM]: {
    component: AccountConfirm,
    layoutSize: "lg",
  },
  [machineStates.MAINTENANCE]: { component: Maintenance, layoutSize: "sm" },
};

const useDefaultStateFromProps = () => {
  const {
    appId: id,
    userEmail,
    blockchain: paramBlockchain,
  } = useParams<{
    appId?: string;
    blockchain?: string;
    userEmail?: string;
  }>();
  const location = useLocation();

  const search = new URLSearchParams(location.search);
  const url = search.get("l6n");
  const nonce = search.get("nonce");
  const channel = search.get("channel");
  const authenticationId = search.get("authenticationId");
  const requestId = search.get("requestId");
  const isThroughBackChannel = channel === "back" && Boolean(authenticationId);
  const blockchain = paramBlockchain || "flow";
  const email = userEmail || getItem(KEY_EMAIL);

  return useMemo(
    () => ({
      isThroughBackChannel,
      authenticationId,
      dapp: {
        id,
        blockchain,
        url,
      },
      user: {
        id: getItem(KEY_USER_ID),
        email,
        accessToken: getItem(KEY_ACCESS_TOKEN),
        deviceKey: getItem(KEY_DEVICE_KEY),
        deviceId: getItem(KEY_DEVICE_ID),
        addresses: {},
        type: getItem(KEY_USER_TYPE),
        nonce,
      },
      requestId,
    }),
    [location]
  );
};

const Noop = () => null;

const Authenticate = withAuthenticateContext(
  memo(() => {
    const state = useDefaultStateFromProps();
    const { value, send } = useAuthenticateMachine();
    const [stage, setStage] = useState(machineStates.IDLE);
    const { setLayoutSize } = useLayoutContext();

    const handleMessage = (event: MessageEvent) => {
      if (
        state.dapp.url === event.origin &&
        event.data.type === FCL_EVENTS.READY_RESPONSE
      ) {
        const { body = {} } = event.data || {};
        const { nonce, appIdentifier } = body;
        send({
          type: "updateUser",
          data: {
            signatureData: {
              nonce,
              appIdentifier,
            },
          },
        });
      }
    };

    // initialization
    useEffect(() => {
      window.addEventListener("message", handleMessage);
      send({ type: "init", data: state });

      return () => window.removeEventListener("message", handleMessage);
      // intentionally run once
      // eslint-disable-next-line
    }, []);

    // Post the ready event for receiving the data for account proof service
    useEffect(() => {
      const l6n = state.dapp.url ? state.dapp.url : "";
      onReady({ l6n, blockchain: state.dapp.blockchain });
    }, [state.dapp.blockchain, state.dapp.url]);

    // check maintenance status for blockchain
    useEffect(() => {
      getMaintenanceStatus(state.dapp.blockchain).then(
        (status) => status.isUnderMaintenance && send("serviceInvalid")
      );
    }, [send]);

    // only set UI stages, skip system stages
    useEffect(() => {
      if (!systemStatus.includes(value as string)) {
        setStage(value as string);
      }
    }, [value]);

    useEffect(() => {
      if (setLayoutSize && stageComponentMapping[stage]?.layoutSize)
        setLayoutSize(stageComponentMapping[stage]?.layoutSize);
    }, [stage, setLayoutSize]);

    const Component = stageComponentMapping[stage]?.component ?? Noop;

    return <Component />;
  })
);

export default Authenticate;
