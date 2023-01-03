import { SignTypedDataVersion, TypedDataUtils } from "@metamask/eth-sig-util";
import { useCallback, useEffect } from "react";
import { getUserInfo } from "src/apis";
import Loading from "src/components/Loading";
import { useSigningMachine } from "src/machines/signing";
import { ETH_EVENTS, onReady } from "src/services/Frame";
import fetchDappInfo from "src/utils/fetchDappInfo";

const Connecting = () => {
  const { context, send } = useSigningMachine();

  const setMessage = useCallback(async (data: any) => {
    const { message, chain, method } = data;
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
          meta: { chain, method, dataType },
        },
        user: {
          type,
        },
      },
    });
  }, []);

  // get message and preprocess
  useEffect(() => {
    if (context.message) return;
    const listener = ({ data }: any) => {
      if (data === null) return;
      if (typeof data !== "object") return;
      if (data.type === ETH_EVENTS.READY_RESPONSE) {
        setMessage(data);
      }
    };
    window.addEventListener("message", listener);
    return () => window.removeEventListener("message", listener);
  }, []);

  // get user type: custodial or not
  useEffect(() => {
    getUserInfo().then(({ type }) =>
      send({ type: "updateUser", data: { type } })
    );
  }, []);

  // notify parant frame ready
  useEffect(() => {
    const { blockchain, url = "" } = context.dapp;
    if (!url) return;
    onReady({ l6n: url, blockchain });
  }, [context.dapp.blockchain, context.dapp.url]);

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

  return <Loading />;
};

export default Connecting;
