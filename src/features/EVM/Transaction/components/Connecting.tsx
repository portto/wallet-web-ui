import { useEffect } from "react";
import {
  getAccountAsset,
  getAccountAssets,
  getAuthorization,
  getUserInfo,
} from "src/apis";
import Loading from "src/components/Loading";
import { useTransactionMachine } from "src/machines/transaction";
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
      const [{ point, type, email, id }, { assets: allAssets }, { value }] =
        await Promise.all([
          getUserInfo(),
          getAccountAssets(),
          getAccountAsset({ blockchain }),
        ]);
      const assets = allAssets.filter(
        (asset: any) => asset.blockchain === blockchain
      );
      const userData = {
        id,
        email,
        type,
        points: point,
        assets,
        sessionId,
        balance: value,
      };
      if (type === "security")
        return send({ type: "nonCustodial", data: userData });

      send({
        type: "ready",
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
