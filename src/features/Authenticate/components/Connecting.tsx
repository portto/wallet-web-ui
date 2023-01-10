import { useCallback, useEffect } from "react";
import { createAuthnQueue } from "src/apis";
import Loading from "src/components/Loading";
import { useAuthenticateMachine } from "src/machines/authenticate";
import fetchDappInfo from "src/utils/fetchDappInfo";

const Connecting = () => {
  const { context, send } = useAuthenticateMachine();

  // enqueue current user into request waiting queue
  useEffect(() => {
    createAuthnQueue().then((data) => send({ type: "updateQueue", data }));
  }, [send]);

  // gather current dapp info
  useEffect(() => {
    const { accessToken } = context.user || {};
    const { name, logo, id, url = "" } = context.dapp || {};
    if (!(name && logo)) {
      fetchDappInfo({ id, url }).then((data) => {
        send({ type: "updateDapp", data });
        send(accessToken ? "skipLogin" : "ready");
      });
    }
  }, [send, context]);

  const handleClose = useCallback(() => send("close"), [send]);

  return <Loading blockchain={context.dapp.blockchain} onClose={handleClose} />;
};

export default Connecting;
