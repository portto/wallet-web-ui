import { getReadableDeviceInfo } from "src/services/Device";
import { KEY_ACCESS_TOKEN, getItem } from "src/services/LocalStorage";
import { apiGet, apiPost } from "../axios";

export const checkEmailExist = (email = "") =>
  apiPost<{ isUnderMaintenance: boolean }>({
    url: "blocto/account/checkEmailExist",
    request: {
      email,
    },
  });

export const requestEmailAuth = ({ action = "login", email = "" }) =>
  apiPost<{ id: string }>({
    url: "blocto/account/requestEmailAuth",
    request: {
      action,
      email,
    },
  });

export const register = ({
  email = "",
  appId = null,
  authCode,
  authCodeId,
  blockchains = ["flow"],
}: {
  email: string;
  appId: string | null;
  authCode: string;
  authCodeId: string;
  blockchains: string[];
}) =>
  apiPost<{
    jwt: string;
    key: string;
  }>({
    url: "blocto/account/register",
    request: {
      email,
      device_info: getReadableDeviceInfo(),
      blockchains,
    },
    headers: {
      "Blocto-Application-Identifier": appId,
      auth_code: authCode,
      auth_code_id: authCodeId,
    },
  });

export const login = ({
  email = "",
  authCode,
  authCodeId,
  totpCode,
}: {
  email: string;
  authCode: string;
  authCodeId: string;
  totpCode: string;
}) =>
  apiPost<{
    jwt: string;
    key: string;
  }>({
    url: "blocto/account/login",
    request: {
      email,
    },
    headers: {
      auth_code: authCode,
      auth_code_id: authCodeId,
      ...(totpCode ? { totp_code: totpCode } : {}),
    },
  });

export const acquireAccessToken = ({
  jwt,
  isSdk = false,
}: {
  jwt: string;
  isSdk: boolean;
}) =>
  apiPost<{
    jwt: string;
    key: string;
  }>({
    url: "blocto/account/acquireAccessToken",
    request: {
      device_info: getReadableDeviceInfo(),
      device_keys: [],
      bypass_approval: true,
      ...(isSdk ? { bypass_type: "web_sdk" } : {}),
    },
    headers: {
      authorization: jwt,
    },
  });

export const checkDeviceConfirmed = ({ jwt }: { jwt: string }) =>
  apiPost({
    url: "blocto/account/checkDeviceConfirmed",
    headers: {
      authorization: jwt,
    },
  });

export const refreshToken = () =>
  apiPost({
    url: "blocto/account/refreshToken",
    isAuthorized: true,
  });

export const getUserInfo = ({ jwt }: { jwt?: string }) =>
  apiGet<{
    email: string;
    type: string;
  }>({
    url: "blocto/account/getUserInfo",
    headers: {
      authorization: jwt || getItem(KEY_ACCESS_TOKEN),
    },
  });

export const getAccountSettings = () =>
  apiGet({
    url: "blocto/account/settings",
    isAuthorized: true,
  });

export const setAccountSettings = (payload = {}) =>
  apiPost({
    url: "blocto/account/settings",
    request: payload,
    isAuthorized: true,
  });

export const getAccountAssets = () =>
  apiGet<{
    assets: Array<{
      name: string;
      type: string;
      status: string;
      wallet_address: string;
      blockchain: string;
    }>;
  }>({
    url: "blocto/account/assets",
    isAuthorized: true,
  });

export const getAccountAsset = ({
  blockchain,
  force = false,
}: {
  blockchain: string;
  force: boolean;
}) =>
  apiGet({
    url: "blocto/account/asset",
    request: {
      blockchain,
      force,
    },
    isAuthorized: true,
  });

export const getAccountFlowAsset = () =>
  apiGet({
    url: "blocto/account/asset",
    request: {
      blockchain: "flow",
    },
    isAuthorized: true,
  });

export const getAccountSolanaAsset = () =>
  apiGet({
    url: "blocto/account/asset",
    request: {
      blockchain: "solana",
    },
    isAuthorized: true,
  });

export const estimateEnableBlockchain = ({
  blockchain,
}: {
  blockchain: string;
}) =>
  apiPost<{ point_cost: string; point_discount: string }>({
    url: "blocto/account/estimateEnableBlockchain",
    request: {
      blockchain,
    },
    isAuthorized: true,
  });

export const enableBlockchain = ({
  blockchain,
  pointCost,
  pointDiscount,
}: {
  blockchain: string;
  pointCost: string;
  pointDiscount: string;
}) =>
  apiPost({
    url: "blocto/account/enableBlockchain",
    request: {
      blockchain,
      point_cost: pointCost,
      point_discount: pointDiscount,
    },
    isAuthorized: true,
  });

export const enableSolana = () =>
  apiPost({
    url: "blocto/account/enableBlockchain",
    request: {
      blockchain: "solana",
    },
    isAuthorized: true,
  });

export const createSharedAccountScript = () =>
  apiPost({
    url: "blocto/flow/createScript",
    request: {
      action: "create_shared_account",
    },
    isAuthorized: true,
  });

export const createSharedAccountTransaction = ({
  script = "",
  args = [],
  authorizers = [],
}) =>
  apiPost({
    url: "blocto/flow/createTransaction",
    request: {
      action: "create_shared_account",
      script,
      args,
      authorizers,
    },
    isAuthorized: true,
  });

export const createSharedAccount = ({
  data,
  signature,
}: {
  data: string;
  signature: string;
}) =>
  apiPost({
    url: "blocto/flow/createSharedAccount",
    request: {
      data,
      signature,
    },
    isAuthorized: true,
  });

export const signTransaction = ({ data }: { data: string }) =>
  apiPost({
    url: "blocto/flow/signTransaction",
    request: {
      raw_payload: data,
    },
    isAuthorized: true,
  });

export const signCosigner = ({ data }: { data: string }) =>
  apiPost({
    url: "blocto/flow/signCosigner",
    request: {
      raw_payload: data,
    },
    isAuthorized: true,
  });

export const signPayer = ({
  data,
  payerId,
}: {
  data: string;
  payerId: string;
}) =>
  apiPost({
    url: "blocto/flow/signPayer",
    request: {
      raw_payload: data,
      payer_id: payerId,
    },
    isAuthorized: true,
  });

export const createSigningRequest = ({ blockchain = "flow", ...payload }) =>
  apiPost({
    url: `blocto/nonCustodial/signingRequest/${blockchain}`,
    request: payload,
    isAuthorized: true,
  });

export const getSigningRequest = ({
  blockchain = "flow",
  id,
}: {
  blockchain: string;
  id: string;
}) =>
  apiGet({
    url: `blocto/nonCustodial/signingRequest/${blockchain}/${id}`,
    isAuthorized: true,
  });

export const signMoonPayUrl = ({ query }: { query: string }) =>
  apiPost({
    url: "blocto/moonpay/paymentRequest",
    request: {
      query,
    },
    isAuthorized: true,
  });

export const getDappInfo = ({ id }: { id: string }) =>
  apiGet<{ name: string; logo: string }>({
    url: `blocto/dapps/${id}/info`,
  });
