import { Box, Flex, FlexProps, Image, chakra } from "@chakra-ui/react";
import { Player } from "@lottiefiles/react-lottie-player";
import placeholder from "src/assets/images/icons/ic-dapp-placeholder.png";
import BloctoLogoWithBg from "src/assets/images/icons/logo-white-bg.svg";
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
        <Image
          src={BloctoLogoWithBg}
          width="48px"
          height="48px"
          borderRadius="50%"
        />
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
