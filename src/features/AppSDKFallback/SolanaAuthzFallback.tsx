import { memo, useEffect, useState } from "react";
import { createDAppAuthorization } from "src/apis";
import { Chains } from "src/types";
import { FALLBACK_ERROR_MESSAGES } from "src/utils/constants";

interface Props {
  blockchain: Chains;
  appId: string;
  requestId: string;
  message: string;
  isInvokeWrapped: boolean;
  publicKeySignaturePairs: Record<string, string>;
  appendTx: Record<string, string>;
}

const SolanaAuthzFallback = memo((props: Props) => {
  const [error, setError] = useState("");
  const {
    blockchain,
    appId,
    requestId,
    message,
    isInvokeWrapped,
    publicKeySignaturePairs,
    appendTx,
  } = props;

  const errorCallback = (err: any) => {
    const errorMessage = err?.response?.data?.error_code
      ? err.response.data.error_code
      : FALLBACK_ERROR_MESSAGES.unexpectedError;
    setError(errorMessage);
  };

  useEffect(() => {
    if (blockchain !== Chains.solana) {
      return setError(FALLBACK_ERROR_MESSAGES.forbiddenBlockchain);
    }

    createDAppAuthorization({
      blockchain,
      message,
      isInvokeWrapped,
      publicKeySignaturePairs,
      appendTx,
    })
      .then(({ authorizationId }) => {
        window.location.href = `${window.location.origin}/${appId}/${blockchain}/authz/${authorizationId}/?requestId=${requestId}`;
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

export default SolanaAuthzFallback;
