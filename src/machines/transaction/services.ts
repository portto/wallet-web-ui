import { updateAuthorization } from "src/apis";
import {
  onTransactionDecline,
  onTransactionResponse,
} from "src/services/Frame";
import { ERROR_MESSAGES } from "src/utils/constants";
import { TransactionMachineContext } from "./definition";

export const finish = async (context: TransactionMachineContext) => {
  const { url = "", blockchain } = context.dapp;
  const { txHash = "" } = context.transaction;
  const { onApprove } = context.user;
  onTransactionResponse({
    blockchain,
    txHash,
    l6n: url,
  });

  onApprove?.(txHash);
};

export const abort = async (context: TransactionMachineContext) => {
  const { sessionId, authorizationId, onReject } = context.user;
  const { blockchain, url = "" } = context.dapp;
  const { error = "" } = context.transaction;

  onTransactionDecline({
    blockchain,
    l6n: url,
    errorMessage: error,
  });

  onReject?.(ERROR_MESSAGES.AUTHZ_DECLINE_ERROR);

  if (authorizationId) {
    await updateAuthorization({
      authorizationId,
      action: "decline",
      sessionId,
      blockchain,
    });
  }
};
