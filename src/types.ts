export enum AssetStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  UNCREATED = "uncreated",
}

export interface AccountAsset {
  name: string;
  type: string;
  status: AssetStatus.PENDING | AssetStatus.CONFIRMED | AssetStatus.UNCREATED;
  wallet_address: string;
  blockchain: string;
  color_icon: string;
  value: number;
}

export enum Chains {
  ethereum = "ethereum",
  bsc = "bsc",
  polygon = "polygon",
  avalanche = "avalanche",
  aptos = "aptos",
  flow = "flow",
  solana = "solana",
}

export interface EvmTransaction {
  from: string;
  to: string;
  value?: string;
  maxPriorityFeePerGas?: string;
  maxFeePerGas?: string;
  gas?: number | string;
  data?: string;
}

export interface RecognizedFlowTx {
  args: { [key: string]: string };
  hash: string;
  balances?: { amount: string };
  arguments?: string[];
}

export interface FlowTransaction {
  addr: string;
  interaction: {
    arguments: {
      [key: string]: {
        value: string;
      };
    };
    params: {
      [key: string]: {
        key: string;
        value: string;
      };
    };
    message: {
      params: string[];
      arguments: string[];
      cadence: string;
    };
  };
  voucher: {
    cadence: string;
    arguments: [
      {
        type: string;
        value: string;
      }
    ];
  };
}
