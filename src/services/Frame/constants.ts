

export const INTERNAL_EVENTS = {
  CONFIRM: "FCL::BLOCTO::INTERNAL",
};

export const FCL_EVENTS = {
  READY: "FCL:VIEW:READY",
  RESPONSE: "FCL:VIEW:RESPONSE",
  READY_RESPONSE: "FCL:VIEW:READY:RESPONSE",
  CLOSE: "FCL:VIEW:CLOSE",
  OPEN: "FCL:VIEW:OPEN",
};

export const FCL_EVENTS_DEPRECATED = {
  FRAME_RESPONSE: "FCL:FRAME:RESPONSE",
  FRAME_READY_RESPONSE: "FCL:FRAME:READY:RESPONSE",
  CHALLENGE_RESPONSE: "FCL::CHALLENGE::RESPONSE",
  CHALLENGE_CANCEL: "FCL::CHALLENGE::CANCEL",
};

export const ETH_EVENTS = {
  READY: "ETH:FRAME:READY",
  READY_RESPONSE: "ETH:FRAME:READY:RESPONSE",
  RESPONSE: "ETH:FRAME:RESPONSE",
  CLOSE: "ETH:FRAME:CLOSE",
};

export const SOL_EVENTS = {
  READY: "SOL:FRAME:READY",
  RESPONSE: "SOL:FRAME:RESPONSE",
  CLOSE: "SOL:FRAME:CLOSE",
};

export const APTOS_EVENTS = {
  READY: "APTOS:FRAME:READY",
  READY_RESPONSE: "APTOS:FRAME:READY:RESPONSE",
  RESPONSE: "APTOS:FRAME:RESPONSE",
  CLOSE: "APTOS:FRAME:CLOSE",
};


export const READY_EVENTS: { [key in string]: string[] } = {
  flow: [FCL_EVENTS.READY],
  ethereum: [ETH_EVENTS.READY],
  solana: [SOL_EVENTS.READY],
  aptos: [APTOS_EVENTS.READY],
};


export const RESPONSE_EVENTS: { [key in string]: string[] } = {
  ethereum: [
    ETH_EVENTS.RESPONSE,
    // @todo: remove fcl events for eth after blocto-sdk@1.0.0, it's only for backward compatibility currently.
    FCL_EVENTS_DEPRECATED.CHALLENGE_RESPONSE,
  ],
  solana: [
    SOL_EVENTS.RESPONSE,
    // @todo: remove fcl events for solana after blocto-sdk@1.0.0, it's only for backward compatibility currently.
    FCL_EVENTS_DEPRECATED.CHALLENGE_RESPONSE,
  ],
  aptos: [
    APTOS_EVENTS.RESPONSE,
  ],
};


export const CLOSE_EVENTS: { [key in string]: string[] } = {
  flow: [
    FCL_EVENTS.CLOSE,
    FCL_EVENTS_DEPRECATED.CHALLENGE_CANCEL,
  ],
  ethereum: [
    ETH_EVENTS.CLOSE,
    // @todo: remove fcl events for eth after blocto-sdk@1.0.0, it's only for backward compatibility currently.
    FCL_EVENTS.CLOSE,
    FCL_EVENTS_DEPRECATED.CHALLENGE_CANCEL,
  ],
  solana: [
    SOL_EVENTS.CLOSE,
    // @todo: remove fcl events for solana after blocto-sdk@1.0.0, it's only for backward compatibility currently.
    FCL_EVENTS.CLOSE,
    FCL_EVENTS_DEPRECATED.CHALLENGE_CANCEL,
  ],
  aptos: [
    APTOS_EVENTS.CLOSE,
  ],
};
