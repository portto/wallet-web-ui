import { memo, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getMaintenanceStatus } from "src/apis";
import { useLayoutContext } from "src/context/layout";
import {
  machineStates,
  useTransactionMachine,
  withTransactionContext,
} from "src/machines/transaction";
import {
  KEY_EMAIL,
  KEY_SESSION_ID,
  KEY_USER_ID,
  KEY_USER_TYPE,
  getItem,
} from "src/services/LocalStorage";
import Connecting from "./components/Connecting";
import DangerousTxAlert from "./components/DangerousTxAlert";
import Main from "./components/Main";

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
  [machineStates.DANGEROUS]: {
    component: DangerousTxAlert,
    layoutSize: "sm",
  },
};

const useDefaultStateFromProps = () => {
  const {
    blockchain,
    authorizationId,
    appId: id,
  } = useParams<{
    appId: string;
    blockchain: string;
    authorizationId: string;
  }>();

  return useMemo(
    () => ({
      dapp: {
        id,
        blockchain,
        url: document.referrer ? new URL(document.referrer).origin : "",
      },
      user: {
        id: getItem(KEY_USER_ID),
        authorizationId,
        sessionId: getItem(KEY_SESSION_ID),
        email: getItem(KEY_EMAIL),
        addresses: {},
        type: getItem(KEY_USER_TYPE),
      },
      transaction: {},
    }),
    [authorizationId, blockchain, id]
  );
};

const Noop = () => null;

const Transaction = withTransactionContext(
  memo(() => {
    const state = useDefaultStateFromProps();
    const { value, send } = useTransactionMachine();
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
    }, [send, state.dapp.blockchain]);

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

export default Transaction;
