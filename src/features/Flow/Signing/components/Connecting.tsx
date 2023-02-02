import { Buffer } from "buffer";
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
      Promise.all([getUserInfo(), getSignatureDetails({ signatureId })]).then(
        ([{ type }, { sessionId, message }]) => {
          send({
            type: type === "normal" ? "ready" : "nonCustodial",
            data: {
              message: {
                raw: Buffer.from(message, "hex").toString(),
                toBeSigned: message,
                meta: { blockchain },
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
    // intentionally run once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = useCallback(() => send("close"), [send]);

  return <Loading blockchain={blockchain} onClose={handleClose} />;
};

export default Connecting;
