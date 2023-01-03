import { Box, Flex, FlexProps, Image, chakra } from "@chakra-ui/react";
import { Player } from "@lottiefiles/react-lottie-player";
import placeholder from "src/assets/images/icons/ic-dapp-placeholder.png";
import { ReactComponent as Logo } from "src/assets/images/icons/logo.svg";
import loadingCircleLeft from "src/assets/lottie/logo-loading-left.json";
import loadingCircleRight from "src/assets/lottie/logo-loading-right.json";

const ChakraPlayer = chakra(Player);

const DappLogo = ({ url, ...rest }: { url: string } & FlexProps) => {
  return (
    <Flex justifyContent="center" {...rest}>
      <Flex
        justifyContent="center"
        alignItems="center"
        width="60px"
        height="60px"
        pos="relative"
        marginRight="space.s"
      >
        <Flex
          bg="white"
          borderRadius="50%"
          width="48px"
          height="48px"
          justifyContent="center"
          alignItems="center"
        >
          <Logo />
        </Flex>

        <ChakraPlayer
          width="100%"
          autoplay
          loop
          src={loadingCircleLeft}
          pos="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
        />
      </Flex>

      <Flex
        justifyContent="center"
        alignItems="center"
        width="60px"
        height="60px"
        pos="relative"
        borderRadius="50%"
      >
        <Box borderRadius="50%" overflow="hidden">
          <object
            data={url || placeholder}
            type="image/jpeg"
            width="48px"
            height="48px"
          >
            <Image src={placeholder} width="48px" height="48px" />
          </object>
        </Box>

        <ChakraPlayer
          autoplay
          loop
          src={loadingCircleRight}
          width="100%"
          pos="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
        />
      </Flex>
    </Flex>
  );
};
export default DappLogo;
