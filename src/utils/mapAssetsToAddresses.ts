const mapAssetsToAddresses = (
  assets: Array<{
    type: string;
    status: string;
    wallet_address: string;
    blockchain: string;
  }>
) =>
  Object.fromEntries(
    assets
      .filter(({ type }) => type === "native")
      .filter(({ status }) => status === "confirmed")
      .map(({ blockchain, wallet_address }) => [blockchain, wallet_address])
  );

export default mapAssetsToAddresses;
