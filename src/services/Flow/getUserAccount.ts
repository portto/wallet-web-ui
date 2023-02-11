import * as fcl from "@onflow/fcl";

interface Account {
  address: string;
  balance: number;
  code: string;
  contracts: Record<string, string>;
  keys: Array<{
    index: number;
    publicKey: string;
    signAlgo: number;
    hashAlgo: number;
    weight: number;
    sequenceNumber: number;
    revoked: boolean;
  }>;
}

export const getUserAccount = (address: string): Promise<Account> =>
  fcl.account(address);
