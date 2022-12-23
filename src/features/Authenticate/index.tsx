import { memo, useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import {
  getItem,
  KEY_ACCESS_TOKEN,
  KEY_DEVICE_KEY,
  KEY_EMAIL,
  KEY_USER_ID,
  KEY_USER_TYPE,
} from "services/LocalStorage";
import {
  withAuthenticateContext,
  machineStates,
  useAuthenticateMachine,
} from "machines/authenticate";

import Connecting from "./components/Connecting";
import Maintenance from "./components/Maintenance";
import Queueing from "./components/Queueing";
import InputEmail from "./components/InputEmail";
import InputOTP from "./components/InputOTP";
import Input2FA from "./components/Input2FA";
import EnableBlockchain from "./components/EnableBlockchain";
import AccountConfirm from "./components/AccountConfirm";
import RunInitScripts from "./components/RunInitScripts";
import { getMaintenanceStatus } from "apis";

const systemStatus = [
  machineStates.IDLE,
  machineStates.VERIFY_USER,
  machineStates.FINISH_PROCESS,
  machineStates.CLOSE,
  machineStates.FINAL,
];

const stageComponentMapping = {
  [machineStates.CONNECTING]: Connecting,
  [machineStates.QUEUEING]: Queueing,
  [machineStates.INPUT_EMAIL]: InputEmail,
  [machineStates.INPUT_OTP]: InputOTP,
  [machineStates.INPUT_2FA]: Input2FA,
  [machineStates.ENABLE_BLOCKCHAIN]: EnableBlockchain,
  [machineStates.ACCOUNT_CONFIRM]: AccountConfirm,
  [machineStates.RUN_INIT_SCRIPTS]: RunInitScripts,
  [machineStates.MAINTENANCE]: Maintenance,
};

const useDefaultStateFromProps = (props: any) => {
  const { appId, userEmail } = useParams<{
    appId?: string;
    userEmail?: string;
  }>();
  const location = useLocation<{
    appId?: string;
    chain?: string;
    l6n: string;
    channel?: string;
    authenticationId?: string;
    thumbnail?: string;
    title?: string;
  }>();

  const search = new URLSearchParams(location.search);
  const url = search.get("l6n");
  const nonce = search.get("nonce");
  const channel = search.get("channel");
  const id = props?.appId || appId || search.get("appId");
  const authenticationId = search.get("authenticationId");
  const thumbnail = search.get("thumbnail");
  const title = search.get("title");
  const isThroughBackChannel = channel === "back" && Boolean(authenticationId);
  const chain = search.get("chain") || props?.chain || "flow";
  const email = userEmail || getItem(KEY_EMAIL);

  const name = title || props?.name;
  const logo = thumbnail || props?.logo;

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
        chain,
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
        onReject
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

    // initialization
    useEffect(() => {
      send({ type: "init", data: state });
      // intentionally run once
      // eslint-disable-next-line
    }, []);

    // check maintenance status for chain
    useEffect(() => {
      getMaintenanceStatus(state.dapp.chain).then(
        (status) => status.isUnderMaintenance && send("serviceInvalid")
      );
    }, [send]);

    // only set UI stages, skip system stages
    useEffect(() => {
      if (!systemStatus.includes(value as string)) {
        setStage(value as string);
      }
    }, [value]);

    const Component = stageComponentMapping[stage] ?? Noop;

    return <Component />;
  })
);

export default Authenticate;
