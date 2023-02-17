// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import * as Sentry from "@sentry/browser";
import { getLocale } from "src/utils/locales";

const IS_LOCAL =
  process.env.REACT_APP_ENV === "local" || !process.env.REACT_APP_ENV;

const API_ERROR_WHITE_LIST_HASH: { [key in string]: number } = {
  account_not_found: 1,
  transaction_not_found: 1,
};

const API_STATUS_WHITE_LIST = [404];

const isWhiteListError = (errorCode: string) =>
  Boolean(errorCode && API_ERROR_WHITE_LIST_HASH[errorCode]);
const isWhiteListStatus = (errorStatus: number) =>
  API_STATUS_WHITE_LIST.indexOf(errorStatus) !== 0;

export const captureException = (
  error: unknown,
  { tags, fingerprint }: { tags: unknown; fingerprint: unknown }
) => {
  if (error) {
    Sentry.withScope((scope) => {
      scope.setExtra("tags", tags);
      scope.setExtra("fingerprint", fingerprint);
      Sentry.captureException(error);
    });
  }
};

export const captureApiError = (error: {
  message: unknown;
  request: { method: string; url: string };
  response: unknown;
  status: unknown;
}) => {
  const errorForSentry = { ...error };
  const {
    message,
    request: { method, url },
    response,
    status,
  } = error;

  let request_id = "none";
  let error_code = "unknown_error";

  if (response) {
    error_code = response.error_code;
    request_id = response.request_id;
  }

  let messageForSentry = message || "API error";
  let fingerprint = ["{{ default }}"];

  if (method || url || error_code || status) {
    messageForSentry = `${method || ""} ${status || ""} ${error_code || ""} ${
      url || ""
    }`;
    errorForSentry.message = messageForSentry;
    fingerprint = [
      `${method || ""}`,
      `${status || ""}`,
      `${error_code || ""}`,
      `${url || ""}`,
    ];
  }

  if (!isWhiteListError(error_code) && !isWhiteListStatus(status)) {
    captureException(new Error(messageForSentry), {
      tags: {
        errorType: "API",
        originMessage: message || "none",
        requestId: request_id || "none",
      },
      fingerprint,
    });
  }

  throw error;
};

export function initSentry() {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_LINK,
    beforeSend(event) {
      // If in local development, log events in console instead of send them to server
      if (IS_LOCAL) {
        // eslint-disable-next-line no-console
        console.debug("Sentry event: ", event);
        return null;
      }
      return event;
    },
  });

  // @ts-expect-error ignore
  Sentry.setTag("locale", getLocale);
}
