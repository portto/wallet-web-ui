import { AuthenticateMachineContext } from "./definition";
import { getAccountAssets, getUserInfo, updateAuthentication } from "apis";
import { KEY_EMAIL, KEY_USER_TYPE, setItem } from "services/LocalStorage";
import checkBlockchainEnabled from "utils/checkBlockchainEnabled";
import mapAssetsToAddresses from "utils/mapAssetsToAddresses";
import { EXP_TIME, INTERNAL_WL_DOMAINS } from "utils/constants";
import { onClose, onInternalConfirm, onResponse } from "services/Frame";

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
      const { chain = "Flow" } = context.dapp;
      const { assets } = await getAccountAssets();

      // Try get user enabled specific chain or not,
      // if no native token asset found, go to enabling UI and try to enable,
      // otherwise go to account confirm account UI
      const addresses = mapAssetsToAddresses(assets);
      const enabled = checkBlockchainEnabled(assets, chain);

      const data = { ...userInfo, addresses };

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
  const { chain, url = "" } = context.dapp;

  const l6n = url;

  onResponse({
    l6n,
    chain,
    nonce,
    address: addresses,
    // keep 'addr' field for backward compatibility, will be removed one day
    addr: addresses?.[chain],
    exp: Date.now() + EXP_TIME,
    email,
    userId: id,
    signatureData,
    signatures,
    ...accountInfo,
  });

  if (isThroughBackChannel) {
    await updateAuthentication({
      authenticationId,
      blockchain: chain,
      action: "approve",
      data: {
        l6n,
        addr: addresses?.[chain],
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
  onConfirm(addresses?.[chain]);
};

export const abort = async (context: AuthenticateMachineContext) => {
  const { isThroughBackChannel } = context;
  const { chain, url = "" } = context.dapp;
  const { authenticationId = "", nonce = "", onReject } = context.user;

  const l6n = url;
  onClose({ l6n, nonce, chain });

  if (isThroughBackChannel) {
    await updateAuthentication({
      authenticationId,
      blockchain: chain,
      action: "decline",
    });
  }
  // try to call reject callback
  onReject();
};
