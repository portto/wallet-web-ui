import { useEffect } from "react";
import Loading from "src/components/Loading";
import { useTransactionMachine } from "src/machines/transaction";
import fetchDappInfo from "src/utils/fetchDappInfo";

const Connecting = () => {
  const { context, send } = useTransactionMachine();

  useEffect(() => {
    // gather current dapp info
    const { name, logo, id, url = "" } = context.dapp || {};
    if (!(name && logo)) {
      fetchDappInfo({ id, url }).then((data) =>
        send({ type: "updateDapp", data })
      );
    }

    send({ type: "ready" });
    // intentionally run once
  }, [context.dapp, send]);

  return <Loading />;
};

export default Connecting;
