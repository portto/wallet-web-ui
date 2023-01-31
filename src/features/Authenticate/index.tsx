import { memo, useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { getMaintenanceStatus } from "src/apis";
import { useLayoutContext } from "src/context/layout";
import {
  machineStates,
  useAuthenticateMachine,
  withAuthenticateContext,
} from "src/machines/authenticate";
import {
  KEY_ACCESS_TOKEN,
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
import RunInitScripts from "./components/RunInitScripts";

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
  [machineStates.RUN_INIT_SCRIPTS]: {
    component: RunInitScripts,
    layoutSize: "sm",
  },
  [machineStates.MAINTENANCE]: { component: Maintenance, layoutSize: "sm" },
};

const useDefaultStateFromProps = (props: any) => {
  const {
    appId,
    userEmail,
    blockchain: paramBlockchain,
  } = useParams<{
    appId?: string;
    blockchain?: string;
    userEmail?: string;
  }>();
  const location = useLocation<{
    l6n: string;
    channel?: string;
    authenticationId?: string;
  }>();

  const search = new URLSearchParams(location.search);
  const url = search.get("l6n");
  const nonce = search.get("nonce");
  const channel = search.get("channel");
  const id = props?.appId || appId || search.get("appId");
  const authenticationId = search.get("authenticationId");
  const isThroughBackChannel = channel === "back" && Boolean(authenticationId);
  const blockchain = paramBlockchain || props?.blockchain || "flow";
  const email = userEmail || getItem(KEY_EMAIL);

  const name = props?.name;
  const logo = props?.logo;

  const noop = () => undefined;
  const onConfirm = props?.onConfirm || noop;
  const onReject = props?.onReject || noop;

  return useMemo(
    () => ({
      isThroughBackChannel,
      dapp: {
        id,
        name,
        logo,
        blockchain,
        url,
      },
      user: {
        id: getItem(KEY_USER_ID),
        email,
        accessToken: getItem(KEY_ACCESS_TOKEN),
        deviceKey: getItem(KEY_DEVICE_KEY),
        action: "register",
        addresses: {},
        type: getItem(KEY_USER_TYPE),
        nonce,
        onConfirm,
        onReject,
      },
    }),
    [location]
  );
};

const Noop = () => null;

const Authenticate = withAuthenticateContext(
  memo((props) => {
    const state = useDefaultStateFromProps(props);
    const { value, send } = useAuthenticateMachine();
    const [stage, setStage] = useState(machineStates.IDLE);
    const { setLayoutSize } = useLayoutContext();

    // initialization
    useEffect(() => {
      send({ type: "init", data: state });
      // intentionally run once
      // eslint-disable-next-line
    }, []);

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
