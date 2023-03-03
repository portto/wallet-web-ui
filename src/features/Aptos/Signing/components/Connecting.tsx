import { useCallback, useEffect } from "react";
import {
  getSignatureDetails,
  getUserInfo,
  updateSignatureDetails,
} from "src/apis";
import Loading from "src/components/Loading";
import { useSigningMachine } from "src/machines/signing";
import { AptosSignatureDetails } from "src/types";
import { ERROR_MESSAGES } from "src/utils/constants";
import fetchDappInfo from "src/utils/fetchDappInfo";

const Connecting = () => {
  const { context, send } = useSigningMachine();
  const {
    dapp: { blockchain, url, id },
    signatureId,
  } = context;

  useEffect(() => {
    if (signatureId) {
      // get user type (custodial or not) and get the details of the signing message
      Promise.all([
        getUserInfo(),
        getSignatureDetails({ blockchain, signatureId }),
      ]).then(([{ type }, signatureDetails]) => {
        const {
          fullMessage,
          message,
          nonce,
          prefix,
          address,
          application,
          chainId,
        } = signatureDetails as AptosSignatureDetails;
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
            },
          },
        });
      });
    }

    fetchDappInfo({ id, url }).then((data) =>
      send({ type: "updateDapp", data })
    );
    // Shouldn't include {url} since {fetchDappInfo} is meant to update them
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockchain, id, send, signatureId]);

  const handleClose = useCallback(() => {
    if (signatureId) {
      updateSignatureDetails({
        signatureId,
        action: "decline",
        blockchain,
      });
    }
    send({
      type: "reject",
      data: { error: ERROR_MESSAGES.SIGN_DECLINE_ERROR },
    });
  }, [blockchain, send, signatureId]);

  return <Loading blockchain={blockchain} onClose={handleClose} />;
};

export default Connecting;
