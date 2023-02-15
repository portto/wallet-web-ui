import { useCallback, useEffect } from "react";
import { createAuthnQueue } from "src/apis";
import Loading from "src/components/Loading";
import { useAuthenticateMachine } from "src/machines/authenticate";
import { KEY_EMAIL, getItem } from "src/services/LocalStorage";
import fetchDappInfo from "src/utils/fetchDappInfo";

const Connecting = () => {
  const { context, send } = useAuthenticateMachine();
  const { accessToken, email } = context.user;
  const { name, logo, id, url } = context.dapp;

  // enqueue current user into request waiting queue
  useEffect(() => {
    createAuthnQueue().then((data) => send({ type: "updateQueue", data }));
  }, [send]);

  // gather current dapp info
  useEffect(() => {
    if (!(name && logo)) {
      fetchDappInfo({ id, url }).then((data) => {
        send({ type: "updateDapp", data });
        let action = "skipLogin";
        if (!accessToken || (email && email !== getItem(KEY_EMAIL))) {
          action = "ready";
        }
        send(action);
      });
    }
    // Shouldn't include {name}, {logo} and {url} since {fetchDappInfo} is meant to update them
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, id, send]);

  const handleClose = useCallback(() => send("close"), [send]);

  return <Loading blockchain={context.dapp.blockchain} onClose={handleClose} />;
};

export default Connecting;
