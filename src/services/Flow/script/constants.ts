import {
  NETWORK_MAINNET,
  NETWORK_SANDBOXNET,
  NETWORK_TESTNET,
} from "../../Env";

export const LOCKED_FLOW_ADDRESS = {
  [NETWORK_MAINNET]: "0x8d0e87b65159ae63",
  [NETWORK_SANDBOXNET]: "0xf4527793ee68aede",
  [NETWORK_TESTNET]: "0x95e019a17d0e23d7",
}[process.env.REACT_APP_NETWORK || NETWORK_TESTNET];

export const FLOW_USD_ADDRESS = {
  [NETWORK_MAINNET]: "0x3c5959b568896393",
  [NETWORK_SANDBOXNET]: "0x6c52cbc80f034d1b",
  [NETWORK_TESTNET]: "0xe223d8a629e49c68",
}[process.env.REACT_APP_NETWORK || NETWORK_TESTNET];

export const FUNGIBLE_TOKEN_ADDRESS = {
  [NETWORK_MAINNET]: "0xf233dcee88fe0abe",
  [NETWORK_SANDBOXNET]: "0xe20612a0776ca4bf",
  [NETWORK_TESTNET]: "0x9a0766d93b6608b7",
}[process.env.REACT_APP_NETWORK || NETWORK_TESTNET];

export const NON_FUNGIBLE_TOKEN_ADDRESS = {
  [NETWORK_MAINNET]: "0x1d7e57aa55817448",
  [NETWORK_SANDBOXNET]: "0x83ade3a54eb3870c",
  [NETWORK_TESTNET]: "0x631e88ae7f1d7c20",
}[process.env.REACT_APP_NETWORK || NETWORK_TESTNET];

export const YAHOO_COLLECTIBLE_ADDRESS =
  {
    [NETWORK_MAINNET]: "0x758252ab932a3416",
    [NETWORK_TESTNET]: "0x5d50ce3fd080edce",
  }[process.env.REACT_APP_NETWORK || NETWORK_TESTNET] || "0x5d50ce3fd080edce";