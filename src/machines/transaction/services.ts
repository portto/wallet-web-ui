import { updateAuthorization } from "src/apis";
import { ETH_EVENTS, onTransactionResponse } from "src/services/Frame";
import { ERROR_MESSAGES } from "src/utils/constants";
import { TransactionMachineContext } from "./definition";

export const finish = async (context: TransactionMachineContext) => {
  const { url = "" } = context.dapp;
  const { txHash = "" } = context.transaction;
  const { onApprove } = context.user;
  onTransactionResponse({
    type: ETH_EVENTS.RESPONSE,
    txHash,
    l6n: url,
  });

  onApprove?.(txHash);
};

export const abort = async (context: TransactionMachineContext) => {
  const { sessionId, authorizationId, onReject } = context.user;
  const { blockchain } = context.dapp;

  onReject?.(ERROR_MESSAGES.AUTHZ_DECLINE_ERROR);
  await updateAuthorization({
    authorizationId,
    action: "reject",
    sessionId,
    blockchain,
  });
};
