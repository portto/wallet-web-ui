// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import bowser from "bowser";

export const isHandheld =
  bowser.mobile || bowser.tablet || window.innerWidth < 960;

export const isIOS = Boolean(bowser.ios);

export const isAndroid = Boolean(bowser.android);

export const isChrome = Boolean(bowser.chrome);

export const isFirefox = Boolean(bowser.firefox);

export const getDeviceInfo = () => ({
  os: bowser.osname,
  osVersion: bowser.osversion,
  browser: bowser.name,
  browserVersion: bowser.version,
});

export const getReadableDeviceInfo = () => {
  const { os, osVersion, browser, browserVersion } = getDeviceInfo();

  return `${os} ${osVersion}, ${browser} ${browserVersion}`;
};
