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
