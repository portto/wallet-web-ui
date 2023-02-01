import { useCallback, useEffect } from "react";
import { getAccountAssets, getAuthorization, getUserInfo } from "src/apis";
import Loading from "src/components/Loading";
import { useTransactionMachine } from "src/machines/transaction";
import { AccountAsset } from "src/types";
import fetchDappInfo from "src/utils/fetchDappInfo";

const Connecting = () => {
  const { context, send } = useTransactionMachine();
  const { authorizationId = "" } = context.user;
  const { blockchain } = context.dapp;

  const fetchTransaction = useCallback(async () => {
    const { sessionId, transaction } = await getAuthorization({
      authorizationId,
      blockchain,
    });
    const [{ point, type, email, id }, { assets: allAssets }] =
      await Promise.all([getUserInfo(), getAccountAssets()]);
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
    if (type === "security")
      return send({ type: "nonCustodial", data: userData });

    send({
      type: "ready",
      data: {
        user: userData,
        transaction: { rawObject: { transaction } },
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

  return <Loading />;
};

export default Connecting;
