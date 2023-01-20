import { FormattedMessage } from "react-intl";
import { getDescriptor } from "src/messages";

interface Props {
  intlKey: string;
  [key: string]: any;
}

export default ({ intlKey, ...props }: Props) => {
  const descriptor = getDescriptor(intlKey);
  if (!descriptor) return null;
  return <FormattedMessage {...descriptor} {...props} />;
};
