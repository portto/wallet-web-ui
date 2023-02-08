import { onSignatureDecline, onSignatureResponse } from "src/services/Frame";
import { Chains } from "src/types";
import { SigningMachineContext } from "./definition";

const formatSignatureInformation = (
  blockchain: Chains,
  messageInfo: SigningMachineContext["message"]
) => {
  const { signature = "" } = messageInfo;
  if (blockchain === Chains.aptos) {
    const {
      bitmap,
      raw,
      toBeSigned,
      meta: { nonce, prefix, address, application, chainId } = {},
    } = messageInfo;
    return {
      signature,
      bitmap,
      fullMessage: toBeSigned,
      message: raw,
      nonce,
      prefix,
      address,
      application,
      chainId,
    };
  }
  return { signature };
};

export const finish = async (context: SigningMachineContext) => {
  const { onApprove } = context.user;
  const { blockchain, url = "" } = context.dapp;
  const result = formatSignatureInformation(blockchain, context.message);

  // Signing messages on Flow goes through the back channel so we don't need to post the response
  if (blockchain !== Chains.flow) {
    onSignatureResponse({
      blockchain,
      l6n: url,
      ...result,
    });
  }

  onApprove?.(result.signature);
};

export const abort = async (context: SigningMachineContext) => {
  const { blockchain, url = "" } = context.dapp;
  const { error } = context.message;
  const { onReject } = context.user;

  // Signing messages on Flow goes through the back channel so we don't need to post the response
  if (blockchain !== Chains.flow) {
    onSignatureDecline({
      blockchain,
      l6n: url,
      errorMessage: error || "Signing message failed with unexpected error",
    });
  }

  onReject?.(error);
};
