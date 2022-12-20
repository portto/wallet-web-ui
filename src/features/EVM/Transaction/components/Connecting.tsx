import { useEffect } from "react";
import Loading from "components/Loading";
import { useTransactionMachine } from "machines/transaction";
import fetchDappInfo from "utils/fetchDappInfo";
import { getAccountAssets, getAuthorization, getUserInfo } from "apis";

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
        await Promise.all([getUserInfo({}), getAccountAssets()]);
      const assets = allAssets.filter(
        (asset: any) => asset.blockchain === blockchain
      );
      const userData = {
        id,
        email,
        type,
        points: point,
        assets,
        sessionId: sessionId,
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
