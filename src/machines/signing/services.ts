import { ETH_EVENTS, onSignatureDecline, onSignatureResponse } from "services/Frame";
import { SigningMachineContext } from "./definition";

export const finish = async (context: SigningMachineContext) => {
  const { onApprove } = context.user;
  const { url = "" } = context.dapp;
  const { signature = "" } = context.message;
  
  onSignatureResponse({
    type: ETH_EVENTS.RESPONSE,
    signature,
    l6n: url,
  });

  onApprove?.(signature);
};

export const abort = async (context: SigningMachineContext) => {
  const { url = "" } = context.dapp;
  const { error } = context.message;
  const { onReject } = context.user;
  onSignatureDecline({ type: ETH_EVENTS.RESPONSE, l6n: url, errorMessage: error });

  onReject?.(error);
};
