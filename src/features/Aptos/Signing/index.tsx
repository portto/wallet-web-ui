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
  [machineStates.NON_CUSTODIAL]: { component: NonCustodial, layoutSize: "sm" },
};

const useDefaultStateFromProps = () => {
  const {
    blockchain,
    appId: id,
    signatureId,
  } = useParams<{
    appId: string;
    blockchain: string;
    signatureId?: string;
  }>();

  return useMemo(
    () => ({
      dapp: {
        id,
        blockchain,
        url: document.referrer ? new URL(document.referrer).origin : "",
      },
      user: {
        type: getItem(KEY_USER_TYPE),
      },
      signatureId,
    }),
    [blockchain, id, signatureId]
  );
};

const FallbackComponent = () => null;

const Signing = withSigningContext(
  memo(() => {
    const state = useDefaultStateFromProps();
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
