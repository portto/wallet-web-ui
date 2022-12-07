import { EVM_CHAINS } from "utils/constants";
import semver from "semver";
import {
  CLOSE_EVENTS,
  FCL_EVENTS,
  FCL_EVENTS_DEPRECATED,
  INTERNAL_EVENTS,
  READY_EVENTS,
  RESPONSE_EVENTS,
} from "./constants";
import { postMessageToParentFrame } from "./utils";

const BLOCTO_ADDRESS = process.env.REACT_APP_BLOCTO_ADDRESS;

export const onInternalConfirm = ({
  l6n,
  accessToken,
  email,
}: {
  l6n: string;
  accessToken: string;
  email: string;
}) => {
  const msg = {
    type: INTERNAL_EVENTS.CONFIRM,
    accessToken,
    l6n,
    email,
  };

  postMessageToParentFrame(msg, l6n);
};

export const onChallengeResponse = ({
  address,
  // keep 'addr' field for backward compatibility, will be removed one day
  addr,
  paddr,
  code,
  exp,
  nonce,
  l6n,
  email,
  userId,
  signatureData,
  signatures = [],
}: any) => {
  let services = [
    // authentication service
    {
      f_type: "Service",
      f_vsn: "1.0.0",
      type: "authn",
      uid: "blocto#authn", // used to dedupe services Private > Public
      id: userId, // wallet providers internal id representation for the user
      identity: {
        address: addr, // users flow address
      },
      scoped: {
        email,
      },
      provider: {
        address: BLOCTO_ADDRESS, // providers flow address
        name: "Blocto",
        icon: "https://blocto.portto.io/icons/icon-512x512.png",
        description: "Blocto is your entrance to blockchain world.",
      },
      authn: `${window.location.origin}/authn`,
      // it needs to stay the same every time the user authenticates
    },
    // autherization service
    {
      f_type: "Service",
      f_vsn: "1.0.0",
      type: "authz",
      uid: "blocto#authz",
      method: "HTTP/POST",
      identity: {
        address: addr,
        keyId: 1,
        addr,
      },
      address: addr,
      addr,
      keyId: 1,
      endpoint: `${window.location.origin}/api/flow/authz`,
      params: {
        sessionId: code, // data that will be sent to the endpoint along with the signable
      },
    },
    // pre-auth service
    {
      f_type: "Service",
      f_vsn: "1.0.0",
      type: "pre-authz",
      uid: "blocto#pre-authz",
      method: "HTTP/POST",
      endpoint: `${window.location.origin}/api/flow/pre-authz`,
      params: {
        sessionId: code, // data that will be sent to the endpoint along with the signable
      },
    },
    {
      f_type: "Service",
      f_vsn: "1.0.0",
      type: "user-signature",
      uid: "blocto#user-signature",
      endpoint: `${window.location.origin}/user-signature`,
      method: "IFRAME/RPC", // HTTP/POST | IFRAME/RPC | HTTP/RPC
      id: code, // wallets internal id for the user
      params: {
        sessionId: code, // data that will be sent to the endpoint along with the signable
      },
    },
    // OpenID Service
    {
      f_type: "Service",
      f_vsn: "1.0.0",
      type: "open-id",
      uid: "blocto#open-id",
      method: "DATA",
      data: {
        f_type: "OpenID",
        f_vsn: "1.0.0",
        email: {
          email,
          email_verified: true,
        },
      },
    },
  ];

  if (signatures.length) {
    const {
      fclVersion,
      nonce: authNounce,
      timestamp,
      appDomainTag,
    } = signatureData;
    const useV2ProvableAuthn =
      fclVersion &&
      (fclVersion === "0.0.79-alpha.4" ||
        // @ts-expect-error fcl version
        semver.gte(semver.coerce(fclVersion), "0.0.80"));
    services = [
      ...services,
      // Account Proof Service
      {
        f_type: "Service",
        f_vsn: "1.0.0",
        type: "account-proof",
        method: "DATA",
        uid: "blocto#account-proof",
        data: {
          f_type: "account-proof",
          f_vsn: useV2ProvableAuthn ? "2.0.0" : "1.0.0",
          // @ts-expect-error signatures
          signatures,
          address: addr, // The user's address
          timestamp, // UNIX timestamp
          domainTag: appDomainTag,
          appDomainTag,
          nonce: authNounce,
        },
      },
    ];
  }

  const response = {
    type: FCL_EVENTS.RESPONSE,
    address,
    addr,
    paddr,
    code,
    expires: exp,
    hks: `${window.location.origin}/api/flow/hooks`,
    nonce,
    l6n,
    services,
  };

  postMessageToParentFrame(
    {
      ...response,
      type: FCL_EVENTS.RESPONSE,
    },
    l6n
  );

  // Backward compatibility
  postMessageToParentFrame(
    {
      ...response,
      type: FCL_EVENTS_DEPRECATED.CHALLENGE_RESPONSE,
    },
    l6n
  );
};

export const onSignatureResponse = ({
  type,
  l6n,
  signature,
}: {
  type: string;
  l6n: string;
  signature: string;
}) => {
  const msg = {
    type,
    status: "APPROVED",
    signature,
  };

  postMessageToParentFrame(msg, l6n);
};

export const onSignatureDecline = ({
  type,
  l6n,
  errorMessage,
}: {
  type: string;
  l6n: string;
  errorMessage: string;
}) => {
  const msg = {
    type,
    status: "DECLINED",
    errorMessage,
  };

  postMessageToParentFrame(msg, l6n);
};

export const onTransactionResponse = ({
  type,
  l6n,
  txHash,
}: {
  type: string;
  l6n: string;
  txHash: string;
}) => {
  const msg = {
    type,
    status: "APPROVED",
    txHash,
  };

  postMessageToParentFrame(msg, l6n);
};

export const onTransactionDecline = ({
  type,
  l6n,
  errorMessage,
}: {
  type: string;
  l6n: string;
  errorMessage: string;
}) => {
  const msg = {
    type,
    status: "DECLINED",
    errorMessage,
  };

  postMessageToParentFrame(msg, l6n);
};

export const onReady = ({ l6n, chain }: { l6n: string; chain: string }) => {
  const isEvmChain = EVM_CHAINS.includes(chain);
  const targetEvents = isEvmChain
    ? READY_EVENTS.ethereum
    : READY_EVENTS[chain] || [];

  targetEvents.forEach((event: string) => {
    postMessageToParentFrame(
      {
        type: event,
        l6n,
      },
      l6n
    );
  });
};

export const onClose = ({
  nonce,
  l6n,
  chain,
}: {
  nonce: string;
  l6n: string;
  chain: string;
}) => {
  const isEvmChain = EVM_CHAINS.includes(chain);

  const targetEvents = isEvmChain ? CLOSE_EVENTS.ethereum : CLOSE_EVENTS[chain];

  targetEvents.forEach((event) => {
    postMessageToParentFrame(
      {
        type: event,
        nonce,
        l6n,
      },
      l6n
    );
  });
};

export const onResponse = ({ l6n, chain, ...args }: any) => {
  const isEvmChain = EVM_CHAINS.includes(chain);
  const targetEvents = isEvmChain
    ? RESPONSE_EVENTS.ethereum
    : RESPONSE_EVENTS[chain];

  if (chain === "flow") {
    onChallengeResponse({
      l6n,
      ...args,
    });
  } else {
    targetEvents.forEach((event) => {
      postMessageToParentFrame(
        {
          ...args,
          type: event,
          l6n,
        },
        l6n
      );
    });
  }
};
