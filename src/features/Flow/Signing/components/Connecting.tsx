import { Buffer } from "buffer";
import { useCallback, useEffect } from "react";
import {
  getSignatureDetails,
  getUserInfo,
  updateSignatureDetails,
} from "src/apis";
import Loading from "src/components/Loading";
import { useSigningMachine } from "src/machines/signing";
import { ERROR_MESSAGES } from "src/utils/constants";
import fetchDappInfo from "src/utils/fetchDappInfo";

const Connecting = () => {
  const { context, send } = useSigningMachine();
  const {
    dapp: { blockchain, url, id },
    signatureId,
    user: { sessionId = "" },
  } = context;

  useEffect(() => {
    if (signatureId) {
      // get user type (custodial or not) and get the details of the signing message
      Promise.all([
        getUserInfo(),
        getSignatureDetails({ signatureId, blockchain, sessionId }),
      ]).then(([{ type }, { message }]) => {
        send({
          type: type === "normal" ? "ready" : "nonCustodial",
          data: {
            message: {
              raw: Buffer.from(message, "hex").toString(),
              toBeSigned: message,
            },
            user: {
              type,
            },
          },
        });
      });
    }

    // gather current dapp info
    fetchDappInfo({ id, url }).then((data) =>
      send({ type: "updateDapp", data })
    );
    // Shouldn't include {url} since {fetchDappInfo} is meant to update them
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockchain, id, send, sessionId, signatureId]);

  const handleClose = useCallback(() => {
    if (signatureId) {
      updateSignatureDetails({
        signatureId,
        sessionId,
        action: "decline",
        blockchain,
      });
    }
    send({
      type: "reject",
      data: { error: ERROR_MESSAGES.SIGN_DECLINE_ERROR },
    });
  }, [blockchain, send, sessionId, signatureId]);

  return <Loading blockchain={blockchain} onClose={handleClose} />;
};

export default Connecting;
