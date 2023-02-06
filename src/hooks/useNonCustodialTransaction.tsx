import { useEffect, useState } from "react";
import { createSigningRequest, getSigningRequest } from "src/apis";
import { useTransactionMachine } from "src/machines/transaction";
import { logSendTx } from "src/services/Amplitude";
import { ERROR_MESSAGES } from "src/utils/constants";

export default function useNonCustodialTransaction(payload: object) {
  const { context, send } = useTransactionMachine();
  const { dapp } = context;
  const [signingRequestId, setSigningRequestId] = useState<string>("");

  // create non custodial signing request
  useEffect(() => {
    createSigningRequest(payload).then(({ id }) => setSigningRequestId(id));
  }, [dapp, payload]);

  // check signing request status
  useEffect(() => {
    const { id = "", blockchain, url = "", name = "" } = dapp;
    const domain = (url ? new URL(url) : {}).host || "";

    const interval = setInterval(async () => {
      const { status, tx_hash: txHash } = await getSigningRequest({
        blockchain,
        id: signingRequestId,
      });
      if (status === "approve") {
        logSendTx({
          domain,
          url,
          chain: blockchain,
          type: "authz",
          dAppName: name,
          dAppId: id,
        });
        clearInterval(interval);
        send({ type: "approve", data: { txHash } });
      } else if (status === "reject") {
        send({
          type: "reject",
          data: { error: ERROR_MESSAGES.AUTHZ_DECLINE_ERROR },
        });
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [dapp, send, signingRequestId]);
}
