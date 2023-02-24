import { Box, Center, Flex, Text } from "@chakra-ui/react";
import FormattedMessage from "src/components/FormattedMessage";
import Header from "./Header";
import LoadingLogo from "./LoadingLogo";

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
      <Box position="absolute" top="0" left="0" width="100%" height="100%">
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
              <FormattedMessage intlKey="app.general.loading" />
            </Text>
            <Text
              color="font.primary"
              fontSize="size.body.3"
              fontWeight="weight.s"
            >
              <FormattedMessage intlKey="app.general.loading.description" />
            </Text>
          </Flex>
        </Center>
      </Box>
    </Box>
  );
};

export default Loading;
