import { useEffect } from "react";
import { getAccountAssets, getAuthorization, getUserInfo } from "src/apis";
import Loading from "src/components/Loading";
import { useTransactionMachine } from "src/machines/transaction";
import { AccountAsset } from "src/types";
import fetchDappInfo from "src/utils/fetchDappInfo";

const Connecting = () => {
  const { context, send } = useTransactionMachine();

  // gather current dapp info
  useEffect(() => {
    const { name, logo, id, url = "" } = context.dapp || {};
    if (!(name && logo)) {
      fetchDappInfo({ id, url }).then((data) =>
        send({ type: "updateDapp", data })
      );
    }
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
          transaction: { rawObject: { transactions } },
        },
      });
    };

    fetchTransaction();
    // intentionally run once
  }, []);

  return <Loading />;
};

export default Connecting;
