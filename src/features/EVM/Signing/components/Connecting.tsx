import { SignTypedDataVersion, TypedDataUtils } from "@metamask/eth-sig-util";
import { useCallback, useEffect } from "react";
import { getSignatureDetails, getUserInfo } from "src/apis";
import Loading from "src/components/Loading";
import { useSigningMachine } from "src/machines/signing";
import { onReady } from "src/services/Frame";
import fetchDappInfo from "src/utils/fetchDappInfo";

const Connecting = () => {
  const { context, send } = useSigningMachine();
  const { blockchain, url = "" } = context.dapp;

  const setMessage = useCallback(
    async (data: any) => {
      const { blockchain } = context.dapp;
      const { message, method } = data;
      let contentToBeSigned = message;
      let dataType;
      if (
        [
          "eth_signTypedData",
          "eth_signTypedData_v3",
          "eth_signTypedData_v4",
        ].includes(method)
      ) {
        dataType = message;
        const version =
          method === "eth_signTypedData_v4" || method === "eth_signTypedData"
            ? SignTypedDataVersion.V4
            : SignTypedDataVersion.V3;
        contentToBeSigned = TypedDataUtils.eip712Hash(
          JSON.parse(dataType),
          version
        ).toString("hex");
      }
      const { type } = await getUserInfo();
      send({
        type: type === "normal" ? "ready" : "nonCustodial",
        data: {
          message: {
            raw: message,
            toBeSigned: contentToBeSigned,
            meta: { blockchain, method, dataType },
          },
          user: {
            type,
          },
        },
      });
    },
    [context.dapp]
  );

  // get message and preprocess
  // intentionally run once
  useEffect(() => {
    const { signatureId = "" } = context.user;
    const { blockchain } = context.dapp;
    getSignatureDetails({ signatureId, blockchain }).then(setMessage);
  }, []);

  // get user type: custodial or not
  useEffect(() => {
    getUserInfo().then(({ type }) =>
      send({ type: "updateUser", data: { type } })
    );
  }, []);

  // notify parant frame ready
  useEffect(() => {
    if (!url) return;
    onReady({ l6n: url, blockchain });
  }, [blockchain, url]);

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

  const handleClose = useCallback(() => send("close"), [send]);

  return <Loading blockchain={blockchain} onClose={handleClose} />;
};

export default Connecting;
