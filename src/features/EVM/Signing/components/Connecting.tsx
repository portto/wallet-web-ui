import { SignTypedDataVersion, TypedDataUtils } from "@metamask/eth-sig-util";
import { useCallback, useEffect } from "react";
import { getSignatureDetails, getUserInfo } from "src/apis";
import Loading from "src/components/Loading";
import { useSigningMachine } from "src/machines/signing";
import { EVMSignatureDetails } from "src/types";
import { ERROR_MESSAGES } from "src/utils/constants";
import fetchDappInfo from "src/utils/fetchDappInfo";

const formatSignData = (message: string, method: string) => {
  let toBeSigned = message;
  let dataType;
  if (
    method &&
    [
      "eth_signTypedData_v3",
      "eth_signTypedData",
      "eth_signTypedData_v4",
    ].includes(method)
  ) {
    dataType = message;
    const version =
      method === "eth_signTypedData_v3"
        ? SignTypedDataVersion.V3
        : SignTypedDataVersion.V4;
    toBeSigned = TypedDataUtils.eip712Hash(
      JSON.parse(dataType),
      version
    ).toString("hex");
  }
  return { toBeSigned, dataType };
};

const Connecting = () => {
  const { context, send } = useSigningMachine();
  const {
    signatureId = "",
    user: { sessionId = "" },
  } = context;
  const { blockchain, url = "", name, logo, id } = context.dapp;

  // get message and preprocess
  // intentionally run once
  useEffect(() => {
    // get user type (custodial or not) and get the details of the signing message
    Promise.all([
      getSignatureDetails({ signatureId, blockchain, sessionId }),
      getUserInfo(),
    ]).then(([signatureDetails, { type }]) => {
      const { message, method } = signatureDetails as EVMSignatureDetails;
      const { toBeSigned, dataType } = formatSignData(message, method);
      send({
        type: type === "normal" ? "ready" : "nonCustodial",
        data: {
          message: {
            raw: message,
            toBeSigned,
            meta: { method, dataType },
          },
          user: {
            type,
          },
        },
      });
    });

    // gather current dapp info
    if (!(name && logo)) {
      fetchDappInfo({ id, url }).then((data) =>
        send({ type: "updateDapp", data })
      );
    }
    // Shouldn't include {name}, {logo} and {url} since {fetchDappInfo} is meant to update them
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockchain, id, send, signatureId]);

  const handleClose = useCallback(
    () =>
      send({
        type: "reject",
        data: { error: ERROR_MESSAGES.SIGN_DECLINE_ERROR },
      }),
    [send]
  );

  return <Loading blockchain={blockchain} onClose={handleClose} />;
};

export default Connecting;
