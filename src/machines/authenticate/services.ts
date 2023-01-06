import { getAccountAssets, getUserInfo, updateAuthentication } from "src/apis";
import { onClose, onInternalConfirm, onResponse } from "src/services/Frame";
import { KEY_EMAIL, KEY_USER_TYPE, setItem } from "src/services/LocalStorage";
import checkBlockchainEnabled from "src/utils/checkBlockchainEnabled";
import { EXP_TIME, INTERNAL_WL_DOMAINS } from "src/utils/constants";
import getBlockchainIcon from "src/utils/getBlockchainIcon";
import mapAssetsToAddresses from "src/utils/mapAssetsToAddresses";
import { AuthenticateMachineContext } from "./definition";

export const verifyUser =
  (context: AuthenticateMachineContext) =>
  async (callback: (args: any) => void) => {
    // Try get user info with token
    let userInfo;
    try {
      userInfo = await getUserInfo({ jwt: context.user.accessToken });
      const { email, type } = userInfo;

      setItem(KEY_EMAIL, email);
      setItem(KEY_USER_TYPE, type);
    } catch (e) {
      return callback("invalidToken");
    }

    // Get account assets & update user info
    const { blockchain = "Flow" } = context.dapp;
    const { assets } = await getAccountAssets();

    // Try get user enabled specific chain or not,
    // if no native token asset found, go to enabling UI and try to enable,
    // otherwise go to account confirm account UI
    const addresses = mapAssetsToAddresses(assets);
    const enabled = checkBlockchainEnabled(assets, blockchain);
    const blockchainIcon = getBlockchainIcon(assets, blockchain);

    const data = { user: { ...userInfo, addresses }, blockchainIcon };

    return callback({
      type: enabled ? "accountReady" : "enableBlockchain",
      data,
    });
  };

export const finish = async (context: AuthenticateMachineContext) => {
  const { isThroughBackChannel } = context;
  const {
    id,
    addresses,
    accountInfo,
    accessToken = "",
    email = "",
    authenticationId = "",
    signatureData,
    signatures,
    nonce,
    onConfirm,
  } = context.user;
  const { blockchain, url = "" } = context.dapp;

  const l6n = url;

  onResponse({
    l6n,
    blockchain,
    nonce,
    address: addresses,
    // keep 'addr' field for backward compatibility, will be removed one day
    addr: addresses?.[blockchain],
    exp: Date.now() + EXP_TIME,
    userId: id,
    signatureData,
    signatures,
    ...accountInfo,
  });

  if (isThroughBackChannel) {
    await updateAuthentication({
      authenticationId,
      blockchain,
      action: "approve",
      data: {
        l6n,
        addr: addresses?.[blockchain],
        ...accountInfo,
        exp: Date.now() + EXP_TIME,
        email,
        userId: id,
        signatureData,
        signatures,
      },
    });
  }

  // pass access token for internal use cases
  if (INTERNAL_WL_DOMAINS.includes(url)) {
    onInternalConfirm({
      l6n,
      accessToken,
      email,
    });
  }

  // try to call callback
  onConfirm(addresses?.[blockchain]);
};

export const abort = async (context: AuthenticateMachineContext) => {
  const { isThroughBackChannel } = context;
  const { blockchain, url = "" } = context.dapp;
  const { authenticationId = "", nonce = "", onReject } = context.user;

  const l6n = url;
  onClose({ l6n, nonce, blockchain });

  if (isThroughBackChannel) {
    await updateAuthentication({
      authenticationId,
      blockchain,
      action: "decline",
    });
  }
  // try to call reject callback
  onReject();
};
