import { FormattedMessage, defineMessage } from "react-intl";
import { MessageKey, getDescriptor } from "src/messages";

interface Props {
  intlKey?: MessageKey;
  [key: string]: any;
}

export default ({ intlKey, ...props }: Props) => {
  if (!intlKey) return null;
  const descriptor = getDescriptor(intlKey);
  if (!descriptor) return null;
  return <FormattedMessage {...defineMessage(descriptor)} {...props} />;
};
