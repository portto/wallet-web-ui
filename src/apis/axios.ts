import axios from "axios";
import axiosRetry from "axios-retry";
import { stringify } from "query-string";
import { KEY_ACCESS_TOKEN, getItem } from "src/services/LocalStorage";
import { captureApiError } from "src/services/Sentry";

const VERSION = process.env.REACT_APP_VERSION;
const WALLET_API_BASE = process.env.REACT_APP_API_BASE;

const instance = axios.create({
  baseURL: WALLET_API_BASE,
  headers: {
    Accept: "application/json",
  },
});
axiosRetry(instance, { retries: 1 });

export const apiGet = <T>({
  url = "",
  request = {},
  isAuthorized = false,
  headers = {},
}) => {
  const updatedHeaders = { ...headers, web_version: VERSION };
  return instance
    .get<undefined, { data: T }>(`/${url}?${stringify(request)}`, {
      headers: {
        ...(isAuthorized
          ? {
              authorization: getItem(KEY_ACCESS_TOKEN),
            }
          : {}),
        ...updatedHeaders,
      },
    })
    .then((response) => Promise.resolve(response.data))
    .catch((e) => captureApiError(e));
};

export const apiPost = <T>({
  url = "",
  request = {},
  isAuthorized = false,
  headers = {},
  baseURL = "",
}) => {
  const updatedHeaders = baseURL
    ? headers
    : {
        ...headers,
        web_version: VERSION,
        nonce: Date.now(),
      };
  return instance
    .post<undefined, { data: T }>(`/${url}`, request, {
      headers: {
        "Content-Type": "application/json",
        ...(isAuthorized
          ? {
              authorization: getItem(KEY_ACCESS_TOKEN),
            }
          : {}),
        ...updatedHeaders,
      },
      ...(baseURL ? { baseURL } : {}),
    })
    .then((response) => Promise.resolve(response.data))
    .catch((e) => captureApiError(e));
};

export const apiPut = <T>({
  url = "",
  request = {},
  isAuthorized = false,
  headers = {},
}) => {
  const updatedHeaders = {
    ...headers,
    web_version: VERSION,
    nonce: Date.now(),
  };
  return instance
    .put<undefined, { data: T }>(`/${url}`, request, {
      headers: {
        "Content-Type": "application/json",
        ...(isAuthorized
          ? {
              authorization: getItem(KEY_ACCESS_TOKEN),
            }
          : {}),
        ...updatedHeaders,
      },
    })
    .then((response) => Promise.resolve(response.data))
    .catch((e) => captureApiError(e));
};

export default instance;
