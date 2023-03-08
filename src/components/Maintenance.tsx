import { Box, Image, Text, VStack } from "@chakra-ui/react";
import underMaintenanceBanner from "src/assets/images/under-maintenance.png";
import FormattedMessage from "src/components/FormattedMessage";
import Header from "src/components/Header";

const Maintenance = ({ onClose }: { onClose?: () => void }) => (
  <Box>
    <Header onClose={onClose ?? (() => window.close())} />
    <VStack justify="center" mt="space.3xl" p="space.s">
      <Image src={underMaintenanceBanner} w={180} />
      <Box px="space.s" textAlign="center">
        <Text
          color="font.primary"
          fontSize="size.heading.4"
          fontWeight="weight.l"
          py="space.2xs"
        >
          <FormattedMessage intlKey="app.general.underMaintenance" />
        </Text>
        <Text color="font.primary" fontSize="size.body.3" fontWeight="weight.s">
          <FormattedMessage intlKey="app.general.maintenanceDescription" />
        </Text>
      </Box>
    </VStack>
  </Box>
);

export default Maintenance;
