import { Center, Flex, Text } from "@chakra-ui/react";
import { FormattedMessage } from "react-intl";
import LoadingLogo from "./LoadingLogo";

const Loading = () => (
  <Center height="100%">
    <Flex flexDirection="column" alignItems="center">
      <LoadingLogo mb="space.s" />

      <Text
        color="font.primary"
        fontSize="size.heading.4"
        fontWeight="weight.l"
        lineHeight="line.height.subheading.1"
        mb="space.2xs"
      >
        <FormattedMessage id="app.general.loading" />
      </Text>
      <Text color="font.primary" fontSize="size.body.3" fontWeight="weight.s">
        <FormattedMessage id="app.general.loading.description" />
      </Text>
    </Flex>
  </Center>
);

export default Loading;
