
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

export const EVM_CHAINS = ["ethereum", "bsc", "polygon", "avalanche"];
