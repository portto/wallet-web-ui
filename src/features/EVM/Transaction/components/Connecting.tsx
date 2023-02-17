import { useCallback, useEffect } from "react";
import { getAccountAssets, getAuthorization, getUserInfo } from "src/apis";
import Loading from "src/components/Loading";
import { useTransactionMachine } from "src/machines/transaction";
import { AccountAsset } from "src/types";
import { ERROR_MESSAGES } from "src/utils/constants";
import fetchDappInfo from "src/utils/fetchDappInfo";

const Connecting = () => {
  const { context, send } = useTransactionMachine();
  const { blockchain } = context.dapp;
  // gather current dapp info
  useEffect(() => {
    const { id, url } = context.dapp || {};
    fetchDappInfo({ id, url }).then((data) =>
      send({ type: "updateDapp", data })
    );

    // intentionally run once
  }, []);

  // get transaction info
  useEffect(() => {
    const { authorizationId = "" } = context.user;
    const { blockchain } = context.dapp;
    const fetchTransaction = async () => {
      const { sessionId, transactions } = await getAuthorization({
        authorizationId,
        blockchain,
      });

      const [{ point, type, email, id }, { assets: allAssets }] =
        await Promise.all([getUserInfo(), getAccountAssets()]);
      const assets = allAssets.filter(
        (asset: AccountAsset) => asset.blockchain === blockchain
      );

      const [{ value: balance = 0, wallet_address: address }] = assets.filter(
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
        address,
      };

      send({
        type: type === "security" ? "nonCustodial" : "ready",
        data: {
          user: userData,
          transaction: { rawObject: { transactions } },
        },
      });
    };

    fetchTransaction();
    // intentionally run once
  }, []);

  const handleClose = useCallback(async () => {
    send({
      type: "reject",
      data: { error: ERROR_MESSAGES.AUTHZ_DECLINE_ERROR },
    });
  }, [send]);

  return <Loading onClose={handleClose} blockchain={blockchain} />;
};

export default Connecting;
