import { Box, Center, Flex, Text } from "@chakra-ui/react";
import { FormattedMessage, defineMessages } from "react-intl";
import Header from "./Header";
import LoadingLogo from "./LoadingLogo";

const messages = defineMessages({
  loading: {
    id: "app.general.loading",
    defaultMessage: "Connecting...",
  },
  loadingDesc: {
    id: "app.general.loading.description",
    defaultMessage: "It may take a few seconds.",
  },
});

const Loading = ({
  blockchain,
  onClose,
}: {
  blockchain?: string;
  onClose?: () => void;
}) => {
  return (
    <Box position="relative">
      {blockchain && onClose && (
        <Header blockchain={blockchain} onClose={onClose} />
      )}
      <Box
        position="absolute"
        top="0"
        left="0"
        zIndex={-1}
        width="100%"
        height="100%"
      >
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
              <FormattedMessage {...messages.loading} />
            </Text>
            <Text
              color="font.primary"
              fontSize="size.body.3"
              fontWeight="weight.s"
            >
              <FormattedMessage {...messages.loadingDesc} />
            </Text>
          </Flex>
        </Center>
      </Box>
    </Box>
  );
};

export default Loading;
