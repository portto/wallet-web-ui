import { memo, useEffect, useState } from "react";
import Web3 from "web3";
import { createAuthorization, getLatestBlock } from "src/apis";
import { Chains } from "src/types";
import { EVM_CHAINS, FALLBACK_ERROR_MESSAGES } from "src/utils/constants";

const { toBN, toHex } = Web3.utils;

interface Props {
  blockchain: Chains;
  appId: string;
  requestId: string;
  from: string;
  to: string;
  value: string;
  data: string;
}

const EVMAuthzFallback = memo((props: Props) => {
  const [error, setError] = useState("");
  const { blockchain, appId, requestId, from, to, value, data } = props;

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

    getLatestBlock()
      .then(({ result }) => {
        // Following the default setting in web3js
        // maxPriorityFeePerGas defaults to 2.5 Gwei
        const maxPriorityFeePerGas = "0x9502F900"; // 2.5 Gwei
        // maxFeePerGas defaults to (2 * block.baseFeePerGas) + maxPriorityFeePerGas
        const maxFeePerGas = toHex(
          toBN(result.baseFeePerGas)
            .mul(toBN(2))
            .add(toBN(maxPriorityFeePerGas))
        );
        createAuthorization({
          txs: [
            {
              from,
              maxFeePerGas,
              maxPriorityFeePerGas,
              to,
              value,
              data,
            },
          ],
          blockchain,
          isInDApp: true,
        })
          .then(({ authorizationId }) => {
            window.location.href = `${window.location.origin}/${appId}/${blockchain}/authz/${authorizationId}/?requestId=${requestId}`;
          })
          .catch(errorCallback);
      })
      .catch(errorCallback);
    // intentionally run once
    // eslint-disable-next-line
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

export default EVMAuthzFallback;
