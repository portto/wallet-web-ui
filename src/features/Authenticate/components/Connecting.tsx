import { useCallback, useEffect } from "react";
import { createAuthnQueue, getAuthn } from "src/apis";
import Loading from "src/components/Loading";
import { useAuthenticateMachine } from "src/machines/authenticate";
import { logRequestAccount } from "src/services/Amplitude";
import { KEY_EMAIL, getItem } from "src/services/LocalStorage";
import fetchDappInfo from "src/utils/fetchDappInfo";

const Connecting = () => {
  const { context, send } = useAuthenticateMachine();
  const { authenticationId, isThroughBackChannel } = context;
  const { accessToken, email } = context.user;
  const { id, url = "", blockchain } = context.dapp;

  useEffect(() => {
    const requests =
      authenticationId && isThroughBackChannel
        ? Promise.all([
            createAuthnQueue(), // enqueue current user into request waiting queue
            fetchDappInfo({ id, url }), // gather current dapp info
            getAuthn(authenticationId),
          ])
        : Promise.all([
            createAuthnQueue(), // enqueue current user into request waiting queue
            fetchDappInfo({ id, url }), // gather current dapp info
          ]);

    requests.then(([authnQueuedata, metadata, authentication = {}]) => {
      let type = "skipLogin";
      if (!accessToken || (email && email !== getItem(KEY_EMAIL))) {
        type = "ready";
      }

      logRequestAccount({
        domain: (url ? new URL(url) : {}).host || undefined,
        chain: blockchain,
        dAppName: metadata?.name,
        dAppId: id,
      });
      send({
        type,
        data: {
          queue: authnQueuedata,
          dapp: metadata,
          user:
            authentication && authentication.nonce
              ? {
                  signatureData: {
                    nonce: authentication.nonce,
                    appIdentifier: authentication.appIdentifier,
                  },
                }
              : {},
        },
      });
    });
    // Shouldn't include {url} since {fetchDappInfo} might update it
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, authenticationId, isThroughBackChannel, id, send]);

  const handleClose = useCallback(() => send("close"), [send]);

  return <Loading blockchain={context.dapp.blockchain} onClose={handleClose} />;
};

export default Connecting;
