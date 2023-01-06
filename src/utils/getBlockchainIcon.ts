import { AccountAsset } from "src/types";
import { CHAIN_ASSET_NAME_MAPPING } from "./constants";

const getBlockchainIcon = (
  assets: Array<AccountAsset>,
  chain: string
): string => {
  const assetName = CHAIN_ASSET_NAME_MAPPING[chain];

  const asset = assets.find(
    ({ name, type }) => name === assetName && type === "native"
  );

  return asset?.color_icon || "";
};

export default getBlockchainIcon;
