// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import MemoryStorage from "./MemoryStorage";
import * as keys from "./constants";

const isSupported = () => {
  try {
    window.localStorage.setItem("local_storage_supported", "1");
    const result = window.localStorage.getItem("local_storage_supported");
    window.localStorage.removeItem("local_storage_supported");
    return result === "1";
  } catch (error) {
    return false;
  }
};

const storage = isSupported() ? window.localStorage : MemoryStorage;

export const getItem = (key, defaultValue = null) => {
  const value = storage.getItem(key);

  try {
    return JSON.parse(value) || defaultValue;
  } catch (SyntaxError) {
    return value || defaultValue;
  }
};

export const getRawItem = key => storage.getItem(key);

export const setItem = (key, value) =>
  storage.setItem(
    key,
    typeof value === "string" ? value : JSON.stringify(value)
  );

export const removeItem = (key) => {
  setItem(key, ""); // Due to some versions of browser bug can't removeItem correctly.
  storage.removeItem(key);
};

export const isLatestLocalStorageVersion = () => {
  const LOCAL_STORAGE_VERSION = keys.LOCAL_STORAGE_VERSION;
  const localVersion = getItem(keys.KEY_LOCAL_STORAGE_VERSION);
  return LOCAL_STORAGE_VERSION === localVersion;
};

export const removeOutdatedKeys = () => {
  if (isLatestLocalStorageVersion()) return;

  setItem(keys.KEY_LOCAL_STORAGE_VERSION, keys.LOCAL_STORAGE_VERSION);

  const localKeys = Object.keys(localStorage).filter(key => key.indexOf(keys.APP_STORAGE_KEY_PREFIX) === 0);

  // Using 'Object.values()' fails unit testing because some browsers don't support it
  const localValues = Object.keys(keys).map(it => keys[it]);

  localKeys.forEach((localKey) => {
    const hasMatch = localValues.some(key => key === localKey);
    if (!hasMatch) {
      localStorage.removeItem(localKey);
    }
  });
};
