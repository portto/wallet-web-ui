import { ERROR_MESSAGES } from "src/utils/constants";
import defaultMessages from "./defaultMessages.json";

type MessageKey = keyof typeof defaultMessages;

export const getDescriptor = (key: MessageKey, options: object) => {
  if (!defaultMessages[key]) {
    console.error(ERROR_MESSAGES.INVALID_MESSAGE_KEY);
  }
  return {
    id: `${key}`,
    defaultMessage: defaultMessages[key],
    ...options,
  };
};
