import normalizeDomain from "src/utils/normalizeDomain";
import { getInstance } from "./system";

const IS_LOCAL =
  process.env.REACT_APP_ENV === "local" || !process.env.REACT_APP_ENV;

const logCore = (
  name: string,
  rawProperties: { [key: string]: unknown } = {},
  callback = () => undefined
) => {
  // strip undefined fields
  const properties = Object.assign({}, rawProperties);
  Object.keys(properties).forEach(
    (key) => properties[key] === undefined && delete properties[key]
  );

  if (IS_LOCAL) {
    // eslint-disable-next-line no-console
    console.debug(`[Amplitude] Event: ${name}, properties:`, properties);
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
  const pathnames = pathname.split("/");
  const page = {
    authn: "login",
    authz: "send_tx",
    "user-signature": "sign",
  }[pathnames[3]];
  const chain = pathnames[2];

  if (page && chain) {
    logCore("web_view_page", {
      page,
      chain,
    });
  }
};

export const logRegister = ({
  registerFrom = "sdk_js",
  domain,
  chain,
  dAppName,
  dAppId,
}: {
  registerFrom?: string;
  domain?: string;
  chain: string;
  dAppName?: string;
  dAppId?: string;
}) =>
  logCore("wallet_register", {
    register_from: registerFrom,
    domain: normalizeDomain(domain),
    dApp_name: dAppName,
    dApp_app_id: dAppId,
    chain,
  });

export const logLogin = ({
  product = "sdk_js",
  domain,
  chain,
  dAppName,
  dAppId,
}: {
  product?: string;
  domain?: string;
  chain: string;
  dAppName?: string;
  dAppId?: string;
}) =>
  logCore("wallet_log_in", {
    product,
    domain: normalizeDomain(domain),
    dApp_name: dAppName,
    dApp_app_id: dAppId,
    chain,
  });

// triggered whenever the dapps request user account,
// the implementation is to send this event on authentication page first loaded
export const logRequestAccount = ({
  product = "sdk_js",
  domain,
  chain,
  dAppName,
  dAppId,
}: {
  product?: string;
  domain?: string;
  chain: string;
  dAppName?: string;
  dAppId?: string;
}) =>
  logCore("wallet_approve_request_account", {
    product,
    domain: normalizeDomain(domain),
    dApp_name: dAppName,
    dApp_app_id: dAppId,
    chain,
  });

export const logSendTx = ({
  product = "sdk_js",
  domain,
  chain,
  dAppName,
  dAppId,
}: {
  product?: string;
  domain?: string;
  chain: string;
  dAppName?: string;
  dAppId?: string;
}) =>
  logCore("wallet_approve_confirm_tx", {
    product,
    domain: normalizeDomain(domain),
    dApp_name: dAppName,
    dApp_app_id: dAppId,
    chain,
  });

export const logSignature = ({
  product = "sdk_js",
  domain,
  chain,
  dAppName,
  dAppId,
}: {
  product?: string;
  domain?: string;
  chain: string;
  dAppName?: string;
  dAppId?: string;
}) =>
  logCore("wallet_approve_signature", {
    product,
    domain: normalizeDomain(domain),
    dApp_name: dAppName,
    dApp_app_id: dAppId,
    chain,
  });
