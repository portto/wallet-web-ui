import { Box, Center, Flex, Image, Text } from "@chakra-ui/react";
import { FormattedMessage } from "react-intl";
import logo from "src/assets/images/icons/logo.svg";

const Loading = () => (
  <Center height="100%">
    <Flex flexDirection="column" alignItems="center">
      <Box position="relative" mb="space.s">
        {/* TODO: Add Loading animation */}
        <Image src={logo} />
      </Box>

      <Text
        color="font.primary"
        fontSize="size.heading.4"
        fontWeight="weight.l"
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
