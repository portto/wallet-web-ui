import { memo, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getItem,
  KEY_EMAIL,
  KEY_SESSION_ID,
  KEY_USER_ID,
  KEY_USER_TYPE,
} from "services/LocalStorage";

import Connecting from "./components/Connecting";
import { getMaintenanceStatus } from "apis";
import {
  machineStates,
  useTransactionMachine,
  withTransactionContext,
} from "machines/transaction";
import Main from "./components/Main";
import NonCustodial from "./components/NonCustodial";

const systemStatus = [
  machineStates.IDLE,
  machineStates.FINISH_PROCESS,
  machineStates.CLOSE,
  machineStates.FINAL,
];

const stageComponentMapping = {
  [machineStates.CONNECTING]: Connecting,
  [machineStates.MAIN]: Main,
  [machineStates.NON_CUSTODIAL]: NonCustodial,
};

const useDefaultStateFromProps = (props: any) => {
  const { blockchain, authorizationId, appId } = useParams<{
    appId: string;
    blockchain: string;
    authorizationId: string;
  }>();

  const id = props?.appId || appId;

  const name = props?.name;
  const logo = props?.logo;

  const noop = () => undefined;
  const onApprove = props?.onApprove || noop;
  const onReject = props?.onReject || noop;

  return useMemo(
    () => ({
      dapp: {
        id,
        name,
        logo,
        blockchain,
      },
      user: {
        id: getItem(KEY_USER_ID),
        authorizationId,
        sessionId: getItem(KEY_SESSION_ID),
        email: getItem(KEY_EMAIL),
        addresses: {},
        type: getItem(KEY_USER_TYPE),
        onApprove,
        onReject,
      },
      transaction: {},
    }),
    [location]
  );
};

const Noop = () => null;

const Transaction = withTransactionContext(
  memo((props) => {
    const state = useDefaultStateFromProps(props);
    const { value, send } = useTransactionMachine();
    const [stage, setStage] = useState(machineStates.IDLE);

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

    const Component = stageComponentMapping[stage] ?? Noop;

    return <Component />;
  })
);

export default Transaction;
