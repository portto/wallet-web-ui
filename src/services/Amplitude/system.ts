// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import noop from "lodash/noop";

export const getInstance = () => {
  if (!window.amplitude) {
    return {
      init: noop,
      logEvent: noop,
    };
  }

  return window.amplitude.getInstance();
};

export const initAmplitude = () => {
  const instance = getInstance();
  instance.init(process.env.REACT_APP_AMPLITUDE_KEY, "", {
    disableCookies: true,
    storage: "localStorage",
  });

  /* handle device ID from app */
  if (window.deviceId) {
    instance.setDeviceId(window.deviceId);
  }

  window.addEventListener("bloctoDeviceId", (event) => {
    instance.setDeviceId(event.detail);
  });
};

export const setUserId = userId =>
  getInstance().setUserId(userId);
