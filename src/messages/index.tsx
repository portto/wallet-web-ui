import { MessageDescriptor } from "react-intl";
import { ERROR_MESSAGES } from "src/utils/constants";
import descriptors from "./descriptors";

export interface Message {
  [key: string]: MessageDescriptor;
}
type MessageKey = keyof Message;

export const getDescriptor = (key: MessageKey) => {
  if (!descriptors[key]) {
    console.error(ERROR_MESSAGES.INVALID_MESSAGE_KEY);
  }
  return descriptors[key];
};
