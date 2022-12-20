import { Box } from "@chakra-ui/react";
import { createSigningRequest, getSigningRequest } from "apis";
import { useTransactionMachine } from "machines/transaction";
import { useEffect, useState } from "react";
import { logSendTx } from "services/Amplitude";
import { ERROR_MESSAGES } from "utils/constants";

const NonCustodial = () => {
  const { context, send } = useTransactionMachine();
  const [signingRequestId, setSigningRequestId] = useState<string>("");

  const { user, transaction, dapp } = context;

  // create non custodial signing request
  useEffect(() => {
    const { blockchain, url = "", name = "", logo = "" } = dapp;
    const { rawObject } = transaction;

    createSigningRequest({
      title: name,
      image: logo,
      blockchain,
      url,
      type: "tx",
      txs: rawObject.transactions,
    }).then(({ id }) => setSigningRequestId(id));
  }, [user.sessionId, transaction.rawObject, dapp.blockchain]);

  // check signing request status
  useEffect(() => {
    const { id = "", blockchain, url = "", name = "" } = dapp;
    const domain = new URL(url).host;

    const interval = setInterval(async () => {
      const { status, tx_hash: txHash } = await getSigningRequest({
        blockchain,
        id: signingRequestId,
      });
      if (status === "APPROVED") {
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
      } else if (status === "DECLINED") {
        send({
          type: "reject",
          data: { failReason: ERROR_MESSAGES.AUTHZ_DECLINE_ERROR },
        });
        clearInterval(interval);
      }
    }, 1000);

    return clearInterval(interval);
  }, []);

  return <Box>Non-Custodial</Box>;
};

export default NonCustodial;
