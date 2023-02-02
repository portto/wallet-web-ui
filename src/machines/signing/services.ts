import {
  ETH_EVENTS,
  onSignatureDecline,
  onSignatureResponse,
} from "src/services/Frame";
import { Chains } from "src/types";
import { SigningMachineContext } from "./definition";

export const finish = async (context: SigningMachineContext) => {
  const { onApprove } = context.user;
  const { blockchain, url = "" } = context.dapp;
  const { signature = "" } = context.message;

  // Signing messages on Flow goes throw the back channel so we don't need to post the response
  if (blockchain !== Chains.flow) {
    onSignatureResponse({
      blockchain,
      signature,
      l6n: url,
    });
  }

  onApprove?.(signature);
};

export const abort = async (context: SigningMachineContext) => {
  const { url = "" } = context.dapp;
  const { error } = context.message;
  const { onReject } = context.user;
  onSignatureDecline({
    type: ETH_EVENTS.RESPONSE,
    l6n: url,
    errorMessage: error,
  });

  onReject?.(error);
};
