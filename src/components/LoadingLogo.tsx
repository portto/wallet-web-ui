import { ChakraProps, Flex, Image, chakra } from "@chakra-ui/react";
import { Player } from "@lottiefiles/react-lottie-player";
import { FC } from "react";
import logo from "src/assets/images/icons/logo.svg";
import loadingCircleRight from "src/assets/lottie/logo-loading-right.json";

const ChakraPlayer = chakra(Player);

interface LoadingLogoProps {
  src?: string;
  width?: number | string;
  height?: number | string;
}

const LoadingLogo: FC<LoadingLogoProps & ChakraProps> = ({
  src,
  width,
  height,
  ...rest
}) => (
  <Flex
    justifyContent="center"
    alignItems="center"
    width="60px"
    height="60px"
    position="relative"
    {...rest}
  >
    <Flex
      bg="white"
      borderRadius="50%"
      width="48px"
      height="48px"
      justifyContent="center"
      alignItems="center"
    >
      <Image src={src || logo} width={width} height={height} />
    </Flex>

    <ChakraPlayer
      width="100%"
      autoplay
      loop
      src={loadingCircleRight}
      position="absolute"
      top="50%"
      left="50%"
      transform="translate(-50%, -50%)"
    />
  </Flex>
);

export default LoadingLogo;
