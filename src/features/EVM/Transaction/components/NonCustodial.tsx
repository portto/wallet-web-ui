import { Box } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { createSigningRequest, getSigningRequest } from "src/apis";
import { useTransactionMachine } from "src/machines/transaction";
import { logSendTx } from "src/services/Amplitude";
import { ERROR_MESSAGES } from "src/utils/constants";

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
