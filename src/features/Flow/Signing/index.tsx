import { memo, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getMaintenanceStatus } from "src/apis";
import { useLayoutContext } from "src/context/layout";
import {
  machineStates,
  useSigningMachine,
  withSigningContext,
} from "src/machines/signing";
import {
  KEY_ACCESS_TOKEN,
  KEY_SESSION_ID,
  KEY_USER_TYPE,
  getItem,
} from "src/services/LocalStorage";
import Connecting from "./components/Connecting";
import Main from "./components/Main";
import NonCustodial from "./components/NonCustodial";

const systemStatus = [
  machineStates.IDLE,
  machineStates.FINISH_PROCESS,
  machineStates.CLOSE,
  machineStates.FINAL,
];

const stageComponentMapping: Record<
  string,
  { component: () => JSX.Element; layoutSize: "sm" | "lg" }
> = {
  [machineStates.CONNECTING]: { component: Connecting, layoutSize: "sm" },
  [machineStates.MAIN]: { component: Main, layoutSize: "lg" },
  // [machineStates.NON_CUSTODIAL]: { component: NonCustodial, layoutSize: "lg" },
};

const noop = () => undefined;

const useDefaultStateFromProps = (props: any) => {
  const { blockchain, appId, signatureId } = useParams<{
    appId: string;
    blockchain: string;
    signatureId?: string;
  }>();

  const {
    appId: id = appId,
    message,
    name,
    logo,
    onApprove = noop,
    onReject = noop,
  } = props;

  return useMemo(
    () => ({
      dapp: {
        id,
        name,
        logo,
        blockchain,
      },
      user: {
        accessToken: getItem(KEY_ACCESS_TOKEN),
        sessionId: getItem(KEY_SESSION_ID),
        type: getItem(KEY_USER_TYPE),
        onApprove,
        onReject,
      },
      message,
      signatureId,
    }),
    [blockchain, id, logo, message, name, onApprove, onReject, signatureId]
  );
};

const FallbackComponent = () => null;

const Signing = withSigningContext(
  memo((props) => {
    const state = useDefaultStateFromProps(props);
    const { value, send } = useSigningMachine();
    const [stage, setStage] = useState(machineStates.IDLE);
    const { setLayoutSize } = useLayoutContext();

    // initialization
    useEffect(() => {
      send({ type: "init", data: state });
      // intentionally run once
      // eslint-disable-next-line
    }, []);

    // check maintenance status for chain
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

    const Component =
      stageComponentMapping[stage]?.component ?? FallbackComponent;

    return <Component />;
  })
);

export default Signing;
