import { useCallback, useEffect } from "react";
import { getAccountAssets, getUserInfo } from "src/apis";
import Loading from "src/components/Loading";
import { useTransactionMachine } from "src/machines/transaction";
import { AccountAsset } from "src/types";
import fetchDappInfo from "src/utils/fetchDappInfo";

const Connecting = () => {
  const { context, send } = useTransactionMachine();
  const { blockchain } = context.dapp;

  const fetchUserData = useCallback(async () => {
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
      balance,
    };

    send({
      type: "ready",
      data: {
        user: userData,
      },
    });
  }, [blockchain, send]);

  useEffect(() => {
    // gather current dapp info
    const { name, logo, id, url = "" } = context.dapp || {};
    if (!(name && logo)) {
      fetchDappInfo({ id, url }).then((data) =>
        send({ type: "updateDapp", data })
      );
    }

    fetchUserData();
    // intentionally run once
  }, []);

  return <Loading />;
};

export default Connecting;
