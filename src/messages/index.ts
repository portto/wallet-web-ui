import { ERROR_MESSAGES } from "src/utils/constants";
import defaultMessages from "./defaultMessages";

export interface Message {
  [key: string]: string;
}
type MessageKey = keyof Message;

export const getDescriptor = (key: MessageKey) => {
  if (!defaultMessages[key]) {
    console.error(ERROR_MESSAGES.INVALID_MESSAGE_KEY);
  }
  return {
    id: `${key}`,
    defaultMessage: defaultMessages[key],
  };
};
