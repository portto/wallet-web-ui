import { AccountAsset, AssetStatus } from "src/types";
import { CHAIN_ASSET_NAME_MAPPING } from "./constants";

const checkBlockchainEnabled = (
  assets: Array<AccountAsset>,
  chain: string
): boolean => {
  const assetName = CHAIN_ASSET_NAME_MAPPING[chain];
  const found = assets.find(
    ({ name, type, status }) =>
      name === assetName &&
      type === "native" &&
      status === AssetStatus.CONFIRMED
  );
  return !!found;
};

export default checkBlockchainEnabled;
