import { useCallback, useEffect } from "react";
import {
  getAccountAssets,
  getAuthorization,
  getUserInfo,
  updateAuthorization,
} from "src/apis";
import Loading from "src/components/Loading";
import { useTransactionMachine } from "src/machines/transaction";
import { AccountAsset } from "src/types";
import { ERROR_MESSAGES } from "src/utils/constants";
import fetchDappInfo from "src/utils/fetchDappInfo";

const Connecting = () => {
  const { context, send } = useTransactionMachine();
  const { authorizationId = "" } = context.user;
  const { blockchain } = context.dapp;

  const fetchTransaction = useCallback(async () => {
    const [
      { point, type, email, id },
      { assets: allAssets },
      { sessionId, transaction, convertedTx, extraSignatures },
    ] = await Promise.all([
      getUserInfo(),
      getAccountAssets(),
      getAuthorization({
        authorizationId,
        blockchain,
      }),
    ]);
    const assets = allAssets.filter(
      (asset: AccountAsset) => asset.blockchain === blockchain
    );

    const [{ value: balance = 0 }] = assets.filter(
      (asset: AccountAsset) => asset.type === "native"
    );

    const userData = {
      id,
      email,
      type,
      points: point,
      assets,
      sessionId,
      balance,
    };

    send({
      type: type === "security" ? "nonCustodial" : "ready",
      data: {
        user: userData,
        transaction: {
          rawObject: { transaction, convertedTx, extraSignatures },
        },
      },
    });
  }, [authorizationId, blockchain, send]);

  useEffect(() => {
    // gather current dapp info
    const { name, logo, id, url = "" } = context.dapp || {};
    if (!(name && logo)) {
      fetchDappInfo({ id, url }).then((data) =>
        send({ type: "updateDapp", data })
      );
    }
    // get transaction info
    fetchTransaction();
    // intentionally run once
  }, []);

  const handleClose = useCallback(async () => {
    const { sessionId, authorizationId = "" } = context.user;
    const { blockchain } = context.dapp;
    if (authorizationId) {
      await updateAuthorization({
        authorizationId,
        action: "decline",
        sessionId,
        blockchain,
      });
    }
    send({
      type: "close",
      data: { error: ERROR_MESSAGES.AUTHZ_DECLINE_ERROR },
    });
  }, [context, send]);
  return <Loading onClose={handleClose} blockchain={blockchain} />;
};

export default Connecting;
