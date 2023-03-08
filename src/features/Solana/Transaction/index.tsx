import { memo, useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { getMaintenanceStatus } from "src/apis";
import { useLayoutContext } from "src/context/layout";
import {
  machineStates,
  useTransactionMachine,
  withTransactionContext,
} from "src/machines/transaction";
import {
  KEY_EMAIL,
  KEY_USER_ID,
  KEY_USER_TYPE,
  getItem,
} from "src/services/LocalStorage";

import Connecting from "./components/Connecting";
import Main from "./components/Main";
import Maintenance from "./components/Maintenance";
import NonCustodial from "./components/NonCustodial";
import TxSent from "./components/TxSent";

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
  [machineStates.TX_SENT]: { component: TxSent, layoutSize: "lg" },
  [machineStates.MAINTENANCE]: { component: Maintenance, layoutSize: "sm" },
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
  const location = useLocation();

  const search = new URLSearchParams(location.search);
  const requestId = search.get("requestId");

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
        email: getItem(KEY_EMAIL),
        addresses: {},
        type: getItem(KEY_USER_TYPE),
      },
      transaction: {},
      requestId,
    }),
    [authorizationId, blockchain, id, requestId]
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
