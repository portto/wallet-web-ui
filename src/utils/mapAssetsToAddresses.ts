import { AccountAsset, AssetStatus } from "src/types";

const mapAssetsToAddresses = (assets: Array<AccountAsset>) =>
  Object.fromEntries(
    assets
      .filter(({ type }) => type === "native")
      .filter(({ status }) => status === AssetStatus.CONFIRMED)
      .map(({ blockchain, wallet_address }) => [blockchain, wallet_address])
  );

export default mapAssetsToAddresses;
