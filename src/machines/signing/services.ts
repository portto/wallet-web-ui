import { onSignatureDecline, onSignatureResponse } from "src/services/Frame";
import { Chains } from "src/types";
import { ERROR_MESSAGES, FALLBACK_ERROR_MESSAGES } from "src/utils/constants";
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

  // Redirect to app deep link
  if (context.requestId) {
    window.location.href = `blocto://?request_id=${context.requestId}&signature=${result.signature}`;
  }
};

export const abort = async (context: SigningMachineContext) => {
  const { blockchain, url = "" } = context.dapp;
  const { error } = context.message;

  // Signing messages on Flow goes through the back channel so we don't need to post the response
  if (blockchain !== Chains.flow) {
    onSignatureDecline({
      blockchain,
      l6n: url,
      errorMessage: error || ERROR_MESSAGES.SIGN_UNEXPECTED_ERROR,
    });
  }

  // Redirect to app deep link
  if (context.requestId) {
    window.location.href = `blocto://?request_id=${context.requestId}&error=${
      error === ERROR_MESSAGES.SIGN_DECLINE_ERROR
        ? FALLBACK_ERROR_MESSAGES.userRejected
        : error
    }`;
  }
};
