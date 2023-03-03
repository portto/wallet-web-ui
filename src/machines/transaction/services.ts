import { updateAuthorization } from "src/apis";
import {
  onTransactionDecline,
  onTransactionResponse,
} from "src/services/Frame";
import { ERROR_MESSAGES, FALLBACK_ERROR_MESSAGES } from "src/utils/constants";
import { TransactionMachineContext } from "./definition";

export const finish = async (context: TransactionMachineContext) => {
  const { url = "", blockchain } = context.dapp;
  const { txHash = "" } = context.transaction;

  onTransactionResponse({
    blockchain,
    txHash,
    l6n: url,
  });

  // Redirect to app deep link
  if (context.requestId) {
    window.location.href = `blocto://?request_id=${context.requestId}&tx_hash=${txHash}`;
  }
};

export const abort = async (context: TransactionMachineContext) => {
  const { authorizationId } = context.user;
  const { blockchain, url = "" } = context.dapp;
  const { error = "" } = context.transaction;

  onTransactionDecline({
    blockchain,
    l6n: url,
    errorMessage: error,
  });

  if (authorizationId) {
    updateAuthorization({
      authorizationId,
      action: "decline",
      blockchain,
    });
  }

  // Redirect to app deep link
  if (context.requestId) {
    window.location.href = `blocto://?request_id=${context.requestId}&error=${
      error === ERROR_MESSAGES.AUTHZ_DECLINE_ERROR
        ? FALLBACK_ERROR_MESSAGES.userRejected
        : error
    }`;
  }
};
