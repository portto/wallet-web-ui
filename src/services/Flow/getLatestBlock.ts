import * as fcl from "@onflow/fcl";

interface Block {
  id: string;
  parentId: string;
  height: number;
  timestamp: object;
  collectionGuarantees: Array<{
    collectionId: string;
    signatures: object[];
  }>;
  blockSeals: unknown[];
  signatures: Uint8Array;
}

export const getLatestBlock = (): Promise<Block> =>
  fcl.send([fcl.getBlock(true)]).then(fcl.decode);
