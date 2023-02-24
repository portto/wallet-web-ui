import { Heading, Text } from "@chakra-ui/react";
import React from "react";
import Field from "src/components/Field";
import FormattedMessage from "src/components/FormattedMessage";

const ActivityDetail = ({
  blockchain,
  dAppName,
  address,
}: {
  blockchain: string;
  dAppName?: string;
  address?: string;
}) => {
  return (
    <>
      <Field
        hidableInfo={
          <>
            <Heading
              as="h3"
              fontSize="size.heading.3"
              fontWeight="weight.l"
              mb="space.m"
            >
              <FormattedMessage intlKey="app.authz.activityDetail" />
            </Heading>
            <Field title={<FormattedMessage intlKey="app.authz.network" />}>
              <Text textTransform="capitalize">
                <FormattedMessage
                  intlKey="app.authz.networkWithBlockchain"
                  values={{ blockchain }}
                />
              </Text>
            </Field>
            {dAppName && (
              <Field title={<FormattedMessage intlKey="app.authz.dAppName" />}>
                <Text textTransform="capitalize">{dAppName}</Text>
              </Field>
            )}
            {address && (
              <Field title={<FormattedMessage intlKey="app.authz.address" />}>
                <Text>{address}</Text>
              </Field>
            )}
          </>
        }
        title={<FormattedMessage intlKey="app.authz.activityDetail" />}
      >
        <Text textTransform="capitalize">
          <FormattedMessage
            intlKey="app.authz.networkWithBlockchain"
            values={{ blockchain }}
          />
        </Text>
      </Field>
    </>
  );
};
export default ActivityDetail;
