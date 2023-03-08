import { Box, Image, Text, VStack } from "@chakra-ui/react";
import errorsBanner from "src/assets/images/errors.png";
import FormattedMessage from "src/components/FormattedMessage";
import Header from "src/components/Header";

const Errors = ({
  onClose,
  error,
}: {
  onClose?: () => void;
  error?: Error;
}) => (
  <Box>
    <Header onClose={onClose ?? (() => window.close())} />
    <VStack justify="center" mt="space.3xl" p="space.s">
      <Image src={errorsBanner} w={180} />
      <Box px="space.s" textAlign="center">
        <Text
          color="font.primary"
          fontSize="size.heading.4"
          fontWeight="weight.l"
          py="space.2xs"
        >
          <FormattedMessage intlKey="app.general.error" />
        </Text>
        <Text color="font.primary" fontSize="size.body.3" fontWeight="weight.s">
          {error?.message || "Oopsie doopsie! Something went wrong :'("}
        </Text>
      </Box>
    </VStack>
  </Box>
);

export default Errors;
