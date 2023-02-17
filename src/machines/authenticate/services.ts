import { AnyEventObject, Event } from "xstate";
import { getAccountAssets, getUserInfo, updateAuthentication } from "src/apis";
import { onClose, onInternalConfirm, onResponse } from "src/services/Frame";
import {
  KEY_ACCESS_TOKEN,
  KEY_DEVICE_ID,
  KEY_DEVICE_KEY,
  KEY_EMAIL,
  KEY_SESSION_ID,
  KEY_USER_ID,
  KEY_USER_TYPE,
  removeItem,
  setItem,
} from "src/services/LocalStorage";
import checkBlockchainEnabled from "src/utils/checkBlockchainEnabled";
import {
  EXP_TIME,
  FALLBACK_ERROR_MESSAGES,
  INTERNAL_WL_DOMAINS,
} from "src/utils/constants";
import getBlockchainIcon from "src/utils/getBlockchainIcon";
import mapAssetsToAddresses from "src/utils/mapAssetsToAddresses";
import { AuthenticateMachineContext } from "./definition";

export const setCredentials =
  (context: AuthenticateMachineContext, event: AnyEventObject) =>
  async (callback: (args: Event<AnyEventObject>) => void) => {
    let deviceId;
    if (event?.data?.accessToken) {
      const splittedJwt = event.data.accessToken.split(".");
      const decodedJwtInfo = splittedJwt?.[1] && atob(splittedJwt[1]);
      const jwtInfo = decodedJwtInfo && JSON.parse(decodedJwtInfo);
      if (jwtInfo) {
        deviceId = jwtInfo.device_id;
        setItem(KEY_DEVICE_ID, deviceId);
      }
      setItem(KEY_ACCESS_TOKEN, event.data.accessToken);
      setItem(KEY_DEVICE_KEY, event.data?.deviceKey);
    }

    return callback({ type: "verifyUser", data: { deviceId } });
  };

export const verifyUser =
  (context: AuthenticateMachineContext) =>
  async (callback: (args: Event<AnyEventObject>) => void) => {
    // Try get user info with token
    let userInfo;
    try {
      userInfo = await getUserInfo({ jwt: context.user.accessToken });
      const { email, type, id } = userInfo;
      setItem(KEY_EMAIL, email);
      setItem(KEY_USER_TYPE, type);
      setItem(KEY_USER_ID, id);
    } catch (e) {
      return callback("invalidToken");
    }

    // Get account assets & update user info
    const { blockchain = "flow" } = context.dapp;
    const { assets } = await getAccountAssets();

    // Try get user enabled specific chain or not,
    // if no native token asset found, go to enabling UI and try to enable,
    // otherwise go to account confirm account UI
    const addresses = mapAssetsToAddresses(assets);
    const enabled = checkBlockchainEnabled(assets, blockchain);
    const blockchainIcon = getBlockchainIcon(assets, blockchain);

    const { point, ...restInfo } = userInfo;
    const data = {
      user: { ...restInfo, addresses, points: +point },
      blockchainIcon,
    };

    return callback({
      type: enabled ? "accountReady" : "enableBlockchain",
      data,
    });
  };

export const finish = async (context: AuthenticateMachineContext) => {
  const { isThroughBackChannel, requestId } = context;
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
  } = context.user;
  const { blockchain, url = "", id: appId } = context.dapp;

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
    appId,
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

  // Redirect to app deep link
  if (requestId) {
    window.location.href = `blocto://?request_id=${requestId}&address=${addresses?.[blockchain]}`;
  }
};

export const cleanUpLocalStorage =
  () => async (callback: (args: Event<AnyEventObject>) => void) => {
    removeItem(KEY_ACCESS_TOKEN);
    removeItem(KEY_DEVICE_KEY);
    removeItem(KEY_EMAIL);
    removeItem(KEY_SESSION_ID);
    removeItem(KEY_USER_ID);
    removeItem(KEY_USER_TYPE);
    callback("restart");
  };

export const abort = async (context: AuthenticateMachineContext) => {
  const { isThroughBackChannel, requestId } = context;
  const { blockchain, url = "" } = context.dapp;
  const { authenticationId = "", nonce = "" } = context.user;

  const l6n = url;
  onClose({ l6n, nonce, blockchain });

  if (isThroughBackChannel) {
    await updateAuthentication({
      authenticationId,
      blockchain,
      action: "decline",
    });
  }

  // Redirect to app deep link
  if (requestId) {
    window.location.href = `blocto://?request_id=${requestId}&error=${FALLBACK_ERROR_MESSAGES.userRejected}`;
  }
};
