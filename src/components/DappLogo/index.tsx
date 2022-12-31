import { Box, Flex, Image, chakra } from "@chakra-ui/react";
import { Player } from "@lottiefiles/react-lottie-player";
import placeholder from "src/images/icons/ic-dapp-placeholder.png";
import BloctoLogo from "src/images/icons/logo.svg";
import loadingCircleLeft from "src/images/logo-loading-left.json";
import loadingCircleRight from "src/images/logo-loading-right.json";

const ChakraPlayer = chakra(Player);

const DappLogo = ({ url }: { url: string }) => {
  return (
    <Flex justifyContent="center" mb="12px">
      <Flex
        justifyContent="center"
        alignItems="center"
        width="60px"
        height="60px"
        pos="relative"
        marginRight="12px"
      >
        <Image src={BloctoLogo} width="48px" height="48px" borderRadius="50%" />
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
