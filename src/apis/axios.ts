import axios from "axios";
import axiosRetry from "axios-retry";
import { stringify } from "query-string";
import {
  KEY_ACCESS_TOKEN,
  KEY_APP_ID,
  KEY_SESSION_ID,
  getItem,
} from "src/services/LocalStorage";
import { captureApiError } from "src/services/Sentry";

const VERSION = process.env.REACT_APP_VERSION;
const WALLET_API_BASE = process.env.REACT_APP_API_BASE;

const instance = axios.create({
  baseURL: WALLET_API_BASE,
  headers: {
    Accept: "application/json",
    web_version: VERSION,
    post: {
      "Content-Type": "application/json",
    },
    put: {
      "Content-Type": "application/json",
    },
  },
});

axiosRetry(instance, { retries: 1 });

export const apiGet = <T>({
  url = "",
  request = {},
  withSession = false,
  withAccessToken = false,
  headers: rawHeaders = {},
}) => {
  const headers: any = Object.assign({}, rawHeaders);
  headers["Blocto-Application-Identifier"] = getItem(KEY_APP_ID);
  if (withAccessToken) headers.authorization = getItem(KEY_ACCESS_TOKEN);
  if (withSession)
    headers["Blocto-Session-Identifier"] = getItem(KEY_SESSION_ID);
  return instance
    .get<undefined, { data: T }>(`/${url}?${stringify(request)}`, { headers })
    .then((response) => Promise.resolve(response.data))
    .catch((e) => captureApiError(e));
};

export const apiPost = <T>({
  url = "",
  request = {},
  withSession = false,
  withAccessToken = false,
  headers: rawHeaders = {},
}) => {
  const headers: any = Object.assign({}, rawHeaders);
  headers.nonce = Date.now();
  headers["Blocto-Application-Identifier"] = getItem(KEY_APP_ID);
  if (withSession)
    headers["Blocto-Session-Identifier"] = getItem(KEY_SESSION_ID);
  if (withAccessToken) headers.authorization = getItem(KEY_ACCESS_TOKEN);

  return instance
    .post<undefined, { data: T }>(`/${url}`, request, { headers })
    .then((response) => Promise.resolve(response.data))
    .catch((e) => captureApiError(e));
};

export const apiPut = <T>({
  url = "",
  request = {},
  withSession = false,
  withAccessToken = false,
  headers: rawHeaders = {},
}) => {
  const headers: any = Object.assign({}, rawHeaders);
  headers.nonce = Date.now();
  headers["Blocto-Application-Identifier"] = getItem(KEY_APP_ID);
  if (withSession)
    headers["Blocto-Session-Identifier"] = getItem(KEY_SESSION_ID);
  if (withAccessToken) headers.authorization = getItem(KEY_ACCESS_TOKEN);
  return instance
    .put<undefined, { data: T }>(`/${url}`, request, { headers })
    .then((response) => Promise.resolve(response.data))
    .catch((e) => captureApiError(e));
};

export default instance;
