import { CHAIN_ASSET_NAME_MAPPING } from "./constants";

const checkBlockchainEnabled = (
  assets: Array<{
    name: string;
    type: string;
    status: string;
    wallet_address: string;
    blockchain: string;
  }>,
  chain: string
): boolean => {
  const assetName = CHAIN_ASSET_NAME_MAPPING[chain];
  const found = assets.find(
    ({ name, type, status }) =>
      name === assetName && type === "native" && status !== "uncreated"
  );
  return !!found;
};

export default checkBlockchainEnabled;
