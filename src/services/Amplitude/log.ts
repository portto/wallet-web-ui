import { getInstance } from "./system";

const IS_LOCAL =
  process.env.REACT_APP_ENV === "local" || !process.env.REACT_APP_ENV;
const logCore = (name: string, properties = {}, callback = () => undefined) => {
  if (IS_LOCAL) {
    console.debug(`[Sentry-Log] Event: ${name}, properties:`, properties);
  } else {
    getInstance().logEvent(
      name,
      {
        ...properties,
        environment: process.env.REACT_APP_ENV,
      },
      callback
    );
  }
};

export const logPageView = ({ pathname }: { pathname: string }) => {
  const event = {
    authn: "web_sdk_authentication_viewed",
    authz: "web_sdk_authorization_viewed",
  }[pathname.split("/")[1]];

  if (event) {
    logCore(event);
  }
};

export const logRegister = ({
  domain,
  chain = "flow",
  dAppName,
  dAppId,
}: {
  domain: string;
  chain: string;
  dAppName: string;
  dAppId: string;
}) =>
  logCore(
    "web_sdk_register",
    dAppId ? { domain, chain, dAppName, dAppId } : { domain, chain }
  );

export const logLogin = ({
  domain,
  chain = "flow",
  dAppName,
  dAppId,
}: {
  domain: string;
  chain: string;
  dAppName: string;
  dAppId: string;
}) =>
  logCore(
    "web_sdk_login",
    dAppId ? { domain, chain, dAppName, dAppId } : { domain, chain }
  );

export const logAuthenticated = ({
  domain,
  chain = "flow",
  dAppName,
  dAppId,
}: {
  domain: string;
  chain: string;
  dAppName: string;
  dAppId: string;
}) =>
  logCore(
    "web_sdk_authenticated",
    dAppId ? { domain, chain, dAppName, dAppId } : { domain, chain }
  );

export const logSendTx = ({
  domain,
  chain = "flow",
  url = window.location.href,
  type = "authz",
  dAppName,
  dAppId,
}: {
  domain: string;
  chain: string;
  url: string;
  type: string;
  dAppName: string;
  dAppId: string;
}) =>
  logCore(
    "web_sdk_send_tx",
    dAppId
      ? { domain, chain, url, type, dAppName, dAppId }
      : { domain, chain, url, type }
  );

export const logSignTx = ({
  domain,
  chain = "flow",
  url = window.location.href,
  dAppName,
  dAppId,
}: {
  domain: string;
  chain: string;
  url: string;
  dAppName: string;
  dAppId: string;
}) =>
  logCore(
    "web_sdk_sign_tx",
    dAppId ? { domain, chain, url, dAppName, dAppId } : { domain, chain, url }
  );
