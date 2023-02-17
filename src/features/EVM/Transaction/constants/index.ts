export interface IChainCoinSymbols {
  [key: string]: {
    native: string;
    moonpay: string;
  };
}

export const ChainCoinSymbols: IChainCoinSymbols = {
  ethereum: {
    native: "ETH",
    moonpay: "eth",
  },
  bsc: {
    native: "BNB",
    moonpay: "bnb_bsc",
  },
  polygon: {
    native: "MATIC",
    moonpay: "matic_polygon",
  },
  avalanche: {
    native: "AVAX",
    moonpay: "avax_cchain",
  },
};
