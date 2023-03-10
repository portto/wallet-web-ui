export enum AssetStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  UNCREATED = "uncreated",
}

export interface AccountAsset {
  id: string;
  background_color: string;
  blockchain: string;
  chain_white_icon: string;
  color_icon: string;
  contract_address: string;
  decimals: number;
  group: string;
  name: string;
  type: string;
  status: AssetStatus.PENDING | AssetStatus.CONFIRMED | AssetStatus.UNCREATED;
  symbol: string;
  wallet_address: string;
  usd_price: string;
  value: string;
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

export interface TransactionFeeOption {
  contract_address: string;
  cost: string;
  decimals: number;
  deposit_address: string;
  discount: string;
  symbol: string;
  type: string;
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
  balances?: Record<string, string>;
  arguments?: string[];
  messages: { [key: string]: string };
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
    authorizers: string[];
  };
  from?: string; // @todo: for Flow SDK fallback
  requestId?: string; // @todo: for Flow SDK fallback
}

export interface AptosTransaction {
  arguments: string[];
  function: string;
  type: string;
  type_arguments: string[];
  from?: string; // This is for Aptos SDK fallback
  requestId?: string; // This is for Aptos SDK fallback
}

export interface FlowSignatureDetails {
  message: string;
  origin: string | undefined;
  sessionId: string;
  status: "PENDING" | "APPROVED" | "DECLINED";
  appId: string;
  signatureId?: string;
  vsn?: number;
  reason?: string | null;
  data?: unknown;
}

export interface EVMSignatureDetails extends FlowSignatureDetails {
  method: string;
}

export interface AptosSignatureDetails extends FlowSignatureDetails {
  nonce?: string;
  prefix?: string;
  fullMessage?: string;
  address?: string;
  application?: string;
  chainId?: number;
}

export interface FlowUpdateSignatureDetailsResponse {
  result: "ok";
}

export interface EVMUpdateSignatureDetailsResponse {
  signature: string;
}

export interface AptosUpdateSignatureDetailsResponse {
  signature: string[];
  bitmap: number[];
  fullMessage: string;
  message: string;
  nonce: string;
  prefix: string;
  address?: string;
  application?: string;
  chainId?: number;
}

export interface NonCustodialResponse {
  status: "pending" | "approve" | "reject";
}

export interface NonCustodialTxResponse extends NonCustodialResponse {
  tx_hash: string;
}

export interface FlowNonCustodialSigningResponse extends NonCustodialResponse {
  signature: string;
  address: string;
  id: string;
}

export interface EVMNonCustodialSigningResponse extends NonCustodialResponse {
  signature: string;
}

export interface AptosNonCustodialSigningResponse extends NonCustodialResponse {
  signatures: string[];
  device_key_index: number;
  full_message: string;
  address?: string;
  application?: string;
  chain_id?: number;
  message: string;
  nonce: string;
}

export interface CompositeSignature {
  f_type: "CompositeSignature";
  f_vsn: string;
  addr: string;
  keyId: number;
  signature: string;
}

export interface FlowAuthentication {
  authenticationId: string;
  vsn: number;
  origin: string | undefined;
  appId: string | undefined;
  status: "PENDING" | "APPROVED" | "DECLINED";
  reason: string | null;
  nonce: string | undefined;
  appIdentifier: string | undefined;
  data?: {
    l6n: string;
    addr: string;
    paddr: string;
    code: string;
    exp: number;
    email: string;
    userId: string;
    signatures: CompositeSignature[];
  };
}

type ServiceType =
  | "authn"
  | "authz"
  | "user-signature"
  | "pre-authz"
  | "open-id"
  | "back-channel-rpc"
  | "authn-refresh"
  | "account-proof";

type ServiceMethod =
  | "HTTP/POST"
  | "IFRAME/RPC"
  | "POP/RPC"
  | "TAB/RPC"
  | "EXT/RPC"
  | "DATA";

export interface ChallengeResponse {
  f_type: "PollingResponse";
  f_vsn: string;
  status: "PENDING" | "APPROVED" | "DECLINED";
  data: {
    addr: string;
    paddr: string;
    code: string;
    expires: number;
    hks: string;
    l6n: string;
    services: Array<{
      f_type: "Service";
      f_vsn: string;
      type: ServiceType;
      uid: string;
      method: ServiceMethod;
      id?: string;
      identity?: {
        f_type: "Identity";
        f_vsn: string;
        address: string;
        keyId?: number;
        addr?: string;
      };
      scoped?: { email?: string };
      provider?: {
        f_type: "ServiceProvider";
        f_vsn: string;
        address: string;
        name: string;
        icon: string;
        description: string;
      };
      authn?: string;
      address?: string;
      addr?: string;
      keyId?: number;
      endpoint?: string;
      params?: Record<string, unknown>;
      data?: {
        f_type: string;
        f_vsn: string;
        email?: {
          email: string;
          email_verified: boolean;
        };
        address?: string;
        nonce?: string;
        signatures?: CompositeSignature[];
      };
    }>;
  };
}
