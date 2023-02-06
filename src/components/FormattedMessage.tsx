import { FormattedMessage, defineMessage } from "react-intl";
import { MessageKey, getDescriptor } from "src/messages";

interface Props {
  intlKey?: MessageKey;
  [key: string]: any;
}

export default ({ intlKey, ...props }: Props) => {
  const descriptor = intlKey && getDescriptor(intlKey);
  return (
    <FormattedMessage
      {...(descriptor ? defineMessage(descriptor) : {})}
      {...props}
    />
  );
};
