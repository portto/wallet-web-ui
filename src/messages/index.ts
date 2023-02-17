import { ERROR_MESSAGES } from "src/utils/constants";
import defaultMessages from "./defaultMessages.json";

export type MessageKey = keyof typeof defaultMessages;

export const getDescriptor = (key: MessageKey, options?: object) => {
  if (!defaultMessages[key]) {
    // eslint-disable-next-line no-console
    console.error(ERROR_MESSAGES.INVALID_MESSAGE_KEY);
  }
  return {
    id: `${key}`,
    defaultMessage: defaultMessages[key],
    ...options,
  };
};
