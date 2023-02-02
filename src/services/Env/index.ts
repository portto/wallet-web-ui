// Env variables
export const IS_LOCAL =
  process.env.REACT_APP_ENV === "local" || !process.env.REACT_APP_ENV;
export const IS_STAGING =
  process.env.REACT_APP_ENV === "staging" || !process.env.REACT_APP_ENV;

// Network variables
export const IS_MAINNET = process.env.REACT_APP_NETWORK === "mainnet";
export const IS_SANDBOXNET = process.env.REACT_APP_NETWORK === "sandboxnet";
export const IS_TESTNET = process.env.REACT_APP_NETWORK === "testnet";
