import { Chains, ChallengeResponse } from "src/types";
import { DEFAULT_APP_ID, EVM_CHAINS } from "src/utils/constants";
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
const getNameOfChainWithEvents = (
  blockchain: Chains,
  frameEvents: { [key: string]: string[] }
) => {
  const isEvmChain = EVM_CHAINS.includes(blockchain);
  return isEvmChain ? frameEvents.ethereum : frameEvents[blockchain] || [];
};

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
  appId,
}: any) => {
  let services: ChallengeResponse["data"]["services"] = [
    // authentication service
    {
      f_type: "Service",
      f_vsn: "1.0.0",
      type: "authn",
      method: "DATA",
      uid: "blocto#authn", // used to dedupe services Private > Public
      id: userId, // wallet providers internal id representation for the user
      identity: {
        f_type: "Identity",
        f_vsn: "1.0.0",
        address: addr, // users flow address
      },
      scoped: {
        email,
      },
      provider: {
        f_type: "ServiceProvider",
        f_vsn: "1.0.0",
        address: BLOCTO_ADDRESS || "", // providers flow address
        name: "Blocto",
        icon: "https://blocto.portto.io/icons/icon-512x512.png",
        description: "Blocto is your entrance to blockchain world.",
      },
      authn: `${window.location.origin}/${appId || DEFAULT_APP_ID}/${
        Chains.flow
      }/authn`,
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
        f_type: "Identity",
        f_vsn: "1.0.0",
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
      endpoint: `${window.location.origin}/api/flow/user-signature`,
      method: "HTTP/POST", // HTTP/POST | IFRAME/RPC | HTTP/RPC
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
    const { nonce: authNounce } = signatureData;
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
          f_vsn: "2.0.0",
          signatures,
          address: addr, // The user's address
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
  blockchain,
  l6n,
  signature,
  ...rest
}: {
  blockchain: Exclude<Chains, Chains.flow>;
  l6n: string;
  signature: string | string[];
  [key: string]: any;
}) => {
  const isEvmChain = EVM_CHAINS.includes(blockchain);
  const targetEvents = isEvmChain
    ? RESPONSE_EVENTS.ethereum
    : RESPONSE_EVENTS[blockchain];

  targetEvents.forEach((type) => {
    const msg = {
      type,
      status: "APPROVED",
      signature,
      ...rest,
    };

    postMessageToParentFrame(msg, l6n);
  });
};

export const onSignatureDecline = ({
  blockchain,
  l6n,
  errorMessage,
}: {
  blockchain: Exclude<Chains, Chains.flow>;
  l6n: string;
  errorMessage: string;
}) => {
  const isEvmChain = EVM_CHAINS.includes(blockchain);
  const targetEvents = isEvmChain
    ? RESPONSE_EVENTS.ethereum
    : RESPONSE_EVENTS[blockchain];

  targetEvents.forEach((type) => {
    const msg = {
      type,
      status: "DECLINED",
      errorMessage,
    };

    postMessageToParentFrame(msg, l6n);
  });
};

export const onTransactionResponse = ({
  l6n,
  txHash,
  blockchain,
}: {
  l6n: string;
  txHash: string;
  blockchain: Chains;
}) => {
  const targetEvents = getNameOfChainWithEvents(blockchain, RESPONSE_EVENTS);

  targetEvents.forEach((event: string) => {
    postMessageToParentFrame(
      {
        type: event,
        status: "APPROVED",
        txHash,
      },
      l6n
    );
  });
};

export const onTransactionDecline = ({
  l6n,
  errorMessage,
  blockchain,
}: {
  l6n: string;
  errorMessage: string;
  blockchain: Chains;
}) => {
  const targetEvents = getNameOfChainWithEvents(blockchain, RESPONSE_EVENTS);

  targetEvents.forEach((event: string) => {
    postMessageToParentFrame(
      {
        type: event,
        status: "DECLINED",
        errorMessage,
      },
      l6n
    );
  });
};

export const onReady = ({
  l6n,
  blockchain,
}: {
  l6n: string;
  blockchain: Chains;
}) => {
  const isEvmChain = EVM_CHAINS.includes(blockchain);
  const targetEvents = isEvmChain
    ? READY_EVENTS.ethereum
    : READY_EVENTS[blockchain] || [];

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
  blockchain,
}: {
  nonce: string;
  l6n: string;
  blockchain: Chains;
}) => {
  const isEvmChain = EVM_CHAINS.includes(blockchain);

  const targetEvents = isEvmChain
    ? CLOSE_EVENTS.ethereum
    : CLOSE_EVENTS[blockchain];

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

export const onResponse = ({ l6n, blockchain, ...args }: any) => {
  const isEvmChain = EVM_CHAINS.includes(blockchain);
  const targetEvents = isEvmChain
    ? RESPONSE_EVENTS.ethereum
    : RESPONSE_EVENTS[blockchain];

  if (blockchain === "flow") {
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
