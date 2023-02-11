// Env variables
export const IS_LOCAL =
  process.env.REACT_APP_ENV === "local" || !process.env.REACT_APP_ENV;
export const IS_STAGING =
  process.env.REACT_APP_ENV === "staging" || !process.env.REACT_APP_ENV;

export const NETWORK_MAINNET = "mainnet";
export const NETWORK_SANDBOXNET = "sandboxnet";
export const NETWORK_TESTNET = "testnet";

// Network variables
export const IS_MAINNET = process.env.REACT_APP_NETWORK === NETWORK_MAINNET;
export const IS_SANDBOXNET =
  process.env.REACT_APP_NETWORK === NETWORK_SANDBOXNET;
export const IS_TESTNET = process.env.REACT_APP_NETWORK === NETWORK_TESTNET;
