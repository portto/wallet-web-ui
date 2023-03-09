import { getReadableDeviceInfo } from "src/services/Device";
import { KEY_ACCESS_TOKEN, getItem } from "src/services/LocalStorage";
import {
  AccountAsset,
  AptosNonCustodialSigningResponse,
  Chains,
  EVMNonCustodialSigningResponse,
  FlowNonCustodialSigningResponse,
  NonCustodialTxResponse,
} from "src/types";
import { apiGet, apiPost } from "../axios";

export const checkEmailExist = (email = "") =>
  apiPost<{ exist: boolean }>({
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
  totpCode?: string;
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

export const getUserInfo = (param: { jwt?: string } = {}) =>
  apiGet<{
    id: string;
    email: string;
    type: string;
    point: string;
  }>({
    url: "blocto/account/getUserInfo",
    headers: {
      authorization: param.jwt || getItem(KEY_ACCESS_TOKEN),
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
    assets: Array<AccountAsset>;
  }>({
    url: "blocto/account/assets",
    isAuthorized: true,
  });

export const getAccountAsset = ({
  blockchain,
  force = false,
}: {
  blockchain: Chains;
  force?: boolean;
}) =>
  apiGet<{ value: string; wallet_address: string }>({
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
      blockchain: Chains.flow,
    },
    isAuthorized: true,
  });

export const getAccountSolanaAsset = () =>
  apiGet({
    url: "blocto/account/asset",
    request: {
      blockchain: Chains.solana,
    },
    isAuthorized: true,
  });

export const estimateEnableBlockchain = ({
  blockchain,
}: {
  blockchain: Chains;
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
  blockchain: Chains;
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
      blockchain: Chains.solana,
    },
    isAuthorized: true,
  });

export const signTransaction = ({ data }: { data: string }) =>
  apiPost<{
    id: string;
    address: string;
    signature: string;
    envelope_signatures: string[];
    payload_signatures: [] | null;
  }>({
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
  payerId?: string;
}) =>
  apiPost<{ signature: string; id: number; address: string; payer_id: string }>(
    {
      url: "blocto/flow/signPayer",
      request: {
        raw_payload: data,
        payer_id: payerId,
      },
      isAuthorized: true,
    }
  );

export const createSigningRequest = ({
  blockchain = Chains.flow,
  ...payload
}: {
  blockchain: Chains;
  title: string;
  image: string;
  url: string;
  [key: string]: any;
}) =>
  apiPost<{ id: string }>({
    url: `blocto/nonCustodial/signingRequest/${blockchain}`,
    request: payload,
    isAuthorized: true,
  });

export const getSigningRequest = ({
  blockchain = Chains.flow,
  id,
}: {
  blockchain: Chains;
  id: string;
}) =>
  apiGet<
    | NonCustodialTxResponse
    | FlowNonCustodialSigningResponse
    | EVMNonCustodialSigningResponse
    | AptosNonCustodialSigningResponse
  >({
    url: `blocto/nonCustodial/signingRequest/${blockchain}/${id}`,
    isAuthorized: true,
  });

export const signMoonPayUrl = ({ query }: { query: string }) =>
  apiPost<{ signature: string }>({
    url: "blocto/moonpay/paymentRequest",
    request: {
      query,
    },
    isAuthorized: true,
  });

export const getDappInfo = ({ id }: { id: string }) =>
  apiGet<{
    name: string;
    logo: string;
    web: { web_domain: string };
    blockchains: Chains[];
  }>({
    url: `dapps/${id}/info`,
  });
