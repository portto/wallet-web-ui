import { useCallback, useEffect } from "react";
import { getSignatureDetails, getUserInfo } from "src/apis";
import Loading from "src/components/Loading";
import { useSigningMachine } from "src/machines/signing";
import fetchDappInfo from "src/utils/fetchDappInfo";

const Connecting = () => {
  const { context, send } = useSigningMachine();
  const {
    dapp: { blockchain, url = "", name, logo, id },
    signatureId,
  } = context;

  useEffect(() => {
    if (signatureId) {
      // get user type (custodial or not) and get the details of the signing message
      Promise.all([
        getUserInfo(),
        getSignatureDetails({ blockchain, signatureId }),
      ]).then(
        ([
          { type },
          {
            sessionId,
            fullMessage,
            message,
            nonce,
            prefix,
            address,
            application,
            chainId,
          },
        ]) => {
          send({
            type: type === "normal" ? "ready" : "nonCustodial",
            data: {
              message: {
                raw: message,
                toBeSigned: fullMessage,
                meta: {
                  nonce,
                  prefix,
                  address,
                  application,
                  chainId,
                },
              },
              user: {
                type,
                sessionId,
              },
            },
          });
        }
      );
    }

    // gather current dapp info
    if (!(name && logo)) {
      fetchDappInfo({ id, url }).then((data) =>
        send({ type: "updateDapp", data })
      );
    }
    // Shouldn't include {name}, {logo} and {url} since {fetchDappInfo} is meant to update them
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockchain, id, send, signatureId]);

  const handleClose = useCallback(() => send("close"), [send]);

  return <Loading blockchain={blockchain} onClose={handleClose} />;
};

export default Connecting;
