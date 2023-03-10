import { useCallback, useEffect } from "react";
import {
  getAccountAsset,
  getAccountAssets,
  getAuthorization,
  getUserInfo,
} from "src/apis";
import Loading from "src/components/Loading";
import { useTransactionMachine } from "src/machines/transaction";
import { AccountAsset } from "src/types";
import { ERROR_MESSAGES, FALLBACK_ERROR_MESSAGES } from "src/utils/constants";
import fetchDappInfo from "src/utils/fetchDappInfo";

const Connecting = () => {
  const { context, send } = useTransactionMachine();
  const { authorizationId = "" } = context.user;
  const { blockchain } = context.dapp;

  const fetchTransaction = useCallback(async () => {
    const [{ point, type, email, id }, { assets: allAssets }, { transaction }] =
      await Promise.all([
        getUserInfo(),
        getAccountAssets(),
        getAuthorization({
          authorizationId,
          blockchain,
        }),
      ]);

    if (typeof transaction !== "string" && transaction?.from) {
      // Make sure the user asking for executing the method is the same as the one that currently logs in
      getAccountAsset({ blockchain, force: true })
        .then(({ wallet_address }) => {
          if (wallet_address !== transaction?.from) {
            send({
              type: "reject",
              data: { error: FALLBACK_ERROR_MESSAGES.userNotMatch },
            });
          }
        })
        .catch((err) => {
          const error = err?.response?.data?.error_code
            ? err.response.data.error_code
            : FALLBACK_ERROR_MESSAGES.unexpectedError;
          send({
            type: "reject",
            data: { error },
          });
        });
    }

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
      points: parseFloat(point),
      assets,
      balance,
    };

    send({
      type: type === "security" ? "nonCustodial" : "ready",
      data: {
        user: userData,
        transaction: {
          rawObject: { transaction },
        },
        requestId: typeof transaction !== "string" && transaction?.requestId,
      },
    });
  }, [authorizationId, blockchain, send]);

  useEffect(() => {
    // gather current dapp info
    const { id, url } = context.dapp || {};
    fetchDappInfo({ id, url }).then((data) =>
      send({ type: "updateDapp", data })
    );
    // get transaction info
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
