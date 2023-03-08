import { Chains } from "src/types";

export const CHAIN_ASSET_NAME_MAPPING: { [key in string]: string } = {
  aptos: "Aptos",
  flow: "Flow",
  ethereum: "Ethereum",
  bsc: "Smart Chain",
  solana: "Solana",
  polygon: "Polygon",
  avalanche: "Avalanche",
};

export const EXP_TIME = 86400 * 14 * 1000; // 14 days

export const INTERNAL_WL_DOMAINS = [
  // 'localhost:3000',
  "developers.blocto.app",
  "developers-dev.blocto.app",
  "developers-staging.blocto.app",
  "developers-testnet.blocto.app",
  "sale.blocto.app",
];

export const EVM_CHAINS = [
  Chains.ethereum,
  Chains.bsc,
  Chains.polygon,
  Chains.avalanche,
];

export const ERROR_MESSAGES = {
  AUTHZ_DECLINE_ERROR: "User declined to send the transaction",
  SIGN_DECLINE_ERROR: "User declined the signing request",
  INVALID_MESSAGE_KEY: "Invalid message key",
  SIGN_UNEXPECTED_ERROR: "Signing message failed with unexpected error",
};

export const FALLBACK_ERROR_MESSAGES = {
  userRejected: "user_rejected",
  forbiddenBlockchain: "forbidden_blockchain",
  userNotMatch: "user_not_match",
  unexpectedError: "unexpected_error",
  authFail: "auth_fail",
};

export const DEFAULT_APP_ID = "00000000-0000-0000-0000-000000000000";
