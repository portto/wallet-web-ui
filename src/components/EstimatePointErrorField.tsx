import { Link } from "@chakra-ui/react";
import { ReactNode } from "react";
import { ReactComponent as CheckAlert } from "src/assets/images/icons/check-alert.svg";
import Field from "src/components/Field";
import FieldDetail, { BadgeType } from "src/components/FieldDetail";
import FormattedMessage from "src/components/FormattedMessage";

const EstimatePointErrorField = ({
  content,
}: {
  content: string | ReactNode;
}) => (
  <Field
    title={<FormattedMessage intlKey="app.authz.transactionFeeError" />}
    hidableInfo={
      <FieldDetail
        badgeText={<FormattedMessage intlKey="app.authz.errorMessage" />}
        badgeType={BadgeType.Unverified}
        warningText={
          <FormattedMessage
            intlKey="app.authz.goToHelpCenter"
            values={{
              a: (chunks: ReactNode) => (
                <Link
                  href="https://portto.zendesk.com/hc"
                  isExternal
                  rel="noopener noreferrer"
                >
                  {chunks}
                </Link>
              ),
            }}
          />
        }
      >
        {content}
      </FieldDetail>
    }
    icon={<CheckAlert width="16px" height="16px" />}
  >
    <FormattedMessage intlKey="app.authz.errorMessage" />
  </Field>
);

export default EstimatePointErrorField;
