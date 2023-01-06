import { Box, ChakraProps, Image } from "@chakra-ui/react";
import logo from "src/assets/images/icons/logo.svg";

const LoadingLogo = (props: ChakraProps) => (
  <Box position="relative" {...props}>
    {/* TODO: Add Loading animation */}
    <Image src={logo} />
  </Box>
);

export default LoadingLogo;
