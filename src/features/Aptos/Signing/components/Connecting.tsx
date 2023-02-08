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
    dapp: { blockchain, url = "", name, logo, id },
    signatureId,
    user: { sessionId = "" },
  } = context;

  useEffect(() => {
    if (signatureId) {
      // get user type (custodial or not) and get the details of the signing message
      Promise.all([
        getUserInfo(),
        getSignatureDetails({ blockchain, signatureId, sessionId }),
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
