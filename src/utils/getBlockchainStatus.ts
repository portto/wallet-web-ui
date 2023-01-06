import { AccountAsset } from "src/types";
import { CHAIN_ASSET_NAME_MAPPING } from "./constants";

const getBlockchainStatus = (assets: Array<AccountAsset>, chain: string) => {
  const assetName = CHAIN_ASSET_NAME_MAPPING[chain];
  const found = assets.find(
    ({ name, type }) => name === assetName && type === "native"
  );
  return found?.status;
};

export default getBlockchainStatus;
