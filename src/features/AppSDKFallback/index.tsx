import { parse } from "query-string";
import { memo, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getAccountAsset, getDappInfo } from "src/apis";
import { Chains } from "src/types";
import { FALLBACK_ERROR_MESSAGES } from "src/utils/constants";
import EVMAuthzFallback from "./EVMAuthzFallback";
import EVMSignFallback from "./EVMSignFallback";
import SolanaAuthzFallback from "./SolanaAuthzFallback";

enum RequestMethod {
  Authn = "authn",
  Authz = "authz",
  SignMessage = "signMessage",
  SendTransaction = "send_transaction",
  SignAndSendTransaction = "sign_and_send_transaction",
}

const checkForString = (value: unknown) =>
  typeof value === "string" ? value : "";

const checkForObject = (value: unknown): Record<string, string> =>
  value &&
  typeof value === "object" &&
  Object.values(value).every((member) => typeof member === "string")
    ? (value as Record<string, string>)
    : {};

const formatUrlParam = () => {
  const parsed = parse(window.location.search, {
    arrayFormat: "index",
  });
  const params: Record<string, string | Record<string, string>> = {};
  Object.keys(parsed).forEach((key) => {
    // example: public_key_signature_pairs[2kSrhutfDs5SzkMKTCyJ56qA9V13YPnmgo42t37Yq6jb]
    const splittedKey = decodeURIComponent(key).split(/\[([-a-zA-Z0-9]*)\]/);
    // {attribute} would be 'public_key_signature_pairs'
    const attribute = splittedKey[0];
    // {attributeKey} would be '2kSrhutfDs5SzkMKTCyJ56qA9V13YPnmgo42t37Yq6jb'
    const attributeKey = splittedKey[1];
    if (attributeKey) {
      if (!params[attribute]) {
        params[attribute] = {};
      }
      (params[attribute] as Record<string, string>)[attributeKey] =
        decodeURIComponent(parsed[key] as string);
    } else {
      params[attribute] = decodeURIComponent(parsed[key] as string);
    }
  });
  return params;
};

const useDefaultStateFromProps = () => {
  const {
    appId,
    blockchain,
    method,
    id: requestingId,
  } = useParams<{
    appId?: string;
    blockchain?: Chains;
    method: string;
    id: string;
  }>();

  const urlParam = formatUrlParam();

  const is_invoke_wrapped = urlParam.is_invoke_wrapped;
  const isInvokeWrapped: boolean = is_invoke_wrapped === "true";

  return useMemo(
    () => ({
      dapp: {
        id: appId,
        blockchain,
      },
      request: {
        // @todo: Remove getting the params from the query strings
        id: checkForString(urlParam.request_id),
        method,
        requestingId,
        from: checkForString(urlParam.from),
        message: checkForString(urlParam.message),
        /** For EVM signing */
        type: checkForString(urlParam.type),
        /** For EVM signing */
        /** For EVM send tx */
        to: checkForString(urlParam.to),
        value: checkForString(urlParam.value),
        data: checkForString(urlParam.data),
        /** For EVM send tx */
        /** For Solana sign and send tx */
        publicKeySignaturePairs: checkForObject(
          urlParam.public_key_signature_pairs
        ),
        appendTx: checkForObject(urlParam.append_tx),
        isInvokeWrapped,
        /** For Solana sign and send tx */
      },
    }),
    [appId, requestingId, blockchain, isInvokeWrapped, method, urlParam]
  );
};

const AppSDKFallback = memo(() => {
  const [error, setError] = useState("");
  const {
    dapp: { id: appId, blockchain },
    request: {
      id: requestId,
      method,
      requestingId,
      type,
      from,
      message = "",
      isInvokeWrapped,
      publicKeySignaturePairs,
      appendTx,
      to,
      value,
      data,
    },
  } = useDefaultStateFromProps();

  const errorCallback = (err: any) => {
    const errorMessage = err?.response?.data?.error_code
      ? err.response.data.error_code
      : FALLBACK_ERROR_MESSAGES.unexpectedError;
    setError(errorMessage);
  };

  useEffect(() => {
    if (!appId || !blockchain || !method || !requestingId) {
      return setError(FALLBACK_ERROR_MESSAGES.unexpectedError);
    }

    // Get the dapp metadata. Also, make sure the dapp is on the chain that the user requests.
    getDappInfo({ id: appId })
      .then(({ blockchains }) => {
        if (!blockchains.includes(blockchain)) {
          setError(FALLBACK_ERROR_MESSAGES.forbiddenBlockchain);
        }
      })
      .catch(errorCallback);

    if (from) {
      // Make sure the user asking for executing the method is the same as the one that currently logs in
      getAccountAsset({ blockchain, force: true })
        .then(({ wallet_address }) => {
          if (wallet_address !== from) {
            setError(FALLBACK_ERROR_MESSAGES.userNotMatch);
          }
        })
        .catch(errorCallback);
    }

    if (method === RequestMethod.Authn) {
      window.location.href = `${window.location.origin}/${appId}/${blockchain}/authn/?requestId=${requestingId}`;
    }

    if (blockchain === Chains.aptos && method === RequestMethod.Authz) {
      window.location.href = `${window.location.origin}/${appId}/${blockchain}/authz/?requestId=${requestingId}`;
    }
  }, []);

  useEffect(() => {
    // If the user isn't in the session, we'll get [Error.authFail].
    // Therefore, we need to let the user log in first.
    if (error && error !== FALLBACK_ERROR_MESSAGES.authFail) {
      window.location.href = `blocto://?request_id=${requestId}&error=${error}`;
    }
  }, [error, requestId]);

  switch (method) {
    case RequestMethod.SignMessage:
      return (
        <EVMSignFallback
          // Already check whether the value exists when component did mount
          /* eslint-disable @typescript-eslint/no-non-null-assertion */
          blockchain={blockchain!}
          appId={appId!}
          /* eslint-enable @typescript-eslint/no-non-null-assertion */
          requestId={requestId}
          message={message}
          type={type}
        />
      );
    case RequestMethod.SendTransaction:
      return (
        <EVMAuthzFallback
          // Already check whether the value exists when component did mount
          /* eslint-disable @typescript-eslint/no-non-null-assertion */
          blockchain={blockchain!}
          appId={appId!}
          /* eslint-enable @typescript-eslint/no-non-null-assertion */
          requestId={requestId}
          from={from}
          to={to}
          value={value}
          data={data}
        />
      );
    case RequestMethod.SignAndSendTransaction:
      return (
        <SolanaAuthzFallback
          // Already check whether the value exists when component did mount
          /* eslint-disable @typescript-eslint/no-non-null-assertion */
          blockchain={blockchain!}
          appId={appId!}
          /* eslint-enable @typescript-eslint/no-non-null-assertion */
          requestId={requestId}
          message={message}
          isInvokeWrapped={isInvokeWrapped}
          publicKeySignaturePairs={publicKeySignaturePairs}
          appendTx={appendTx}
        />
      );
    default:
      return null;
  }
});

export default AppSDKFallback;
