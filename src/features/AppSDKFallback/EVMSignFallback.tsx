import { memo, useEffect, useState } from "react";
import Web3 from "web3";
import { createSignatureDetails } from "src/apis";
import { KEY_SESSION_ID, getItem } from "src/services/LocalStorage";
import { Chains } from "src/types";
import { EVM_CHAINS, FALLBACK_ERROR_MESSAGES } from "src/utils/constants";

const { utf8ToHex } = Web3.utils;

const SIGN_TYPE_METHOD_MAPPING: Record<string, string> = {
  sign: "eth_sign",
  personal_sign: "personal_sign",
  typed_data_sign: "eth_signTypedData",
  typed_data_sign_v3: "eth_signTypedData_v3",
  typed_data_sign_v4: "eth_signTypedData_v4",
};

interface Props {
  blockchain: Chains;
  appId: string;
  requestId: string;
  message: string;
  type: string;
}

const EVMSignFallback = memo((props: Props) => {
  const [error, setError] = useState("");
  const { blockchain, appId, requestId, message, type } = props;

  const errorCallback = (err: any) => {
    const errorMessage = err?.response?.data?.error_code
      ? err.response.data.error_code
      : FALLBACK_ERROR_MESSAGES.unexpectedError;
    setError(errorMessage);
  };

  useEffect(() => {
    if (!EVM_CHAINS.includes(blockchain)) {
      return setError(FALLBACK_ERROR_MESSAGES.forbiddenBlockchain);
    }

    if (
      message &&
      type &&
      !Object.keys(SIGN_TYPE_METHOD_MAPPING).includes(type)
    ) {
      return setError(FALLBACK_ERROR_MESSAGES.unexpectedError);
    }

    let messageToBeSigned = message;
    if (SIGN_TYPE_METHOD_MAPPING[type] === SIGN_TYPE_METHOD_MAPPING.sign) {
      messageToBeSigned = messageToBeSigned.slice(2);
    } else if (
      SIGN_TYPE_METHOD_MAPPING[type] === SIGN_TYPE_METHOD_MAPPING.personal_sign
    ) {
      messageToBeSigned = utf8ToHex(messageToBeSigned).slice(2);
    }

    const sessionId = getItem(KEY_SESSION_ID, "");
    createSignatureDetails({
      sessionId,
      blockchain,
      message: messageToBeSigned,
      method: type,
    })
      .then(({ signatureId }) => {
        window.location.href = `${window.location.origin}/${appId}/${blockchain}/user-signature/${signatureId}/?requestId=${requestId}`;
      })
      .catch(errorCallback);
  }, []);

  useEffect(() => {
    // If the user isn't in the session, we'll get [Error.authFail].
    // Therefore, we need to let the user log in first.
    if (error && error !== FALLBACK_ERROR_MESSAGES.authFail) {
      window.location.href = `blocto://?request_id=${requestId}&error=${error}`;
    }
  }, [error, requestId]);

  return null;
});

export default EVMSignFallback;
