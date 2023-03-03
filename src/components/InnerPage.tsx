import { Box, HTMLChakraProps } from "@chakra-ui/react";
import { FC } from "react";
import Header from "./Header";

interface Props {
  isShown: boolean;
  blockchain: string;
  onLastStepClick: () => void;
}

const InnerPage: FC<Props & HTMLChakraProps<"div">> = ({
  isShown,
  blockchain,
  onLastStepClick,
  children,
  ...rest
}) => {
  return (
    <Box
      flexDirection="column"
      width="100%"
      height="100%"
      bg="background.primary"
      position="absolute"
      left="100%"
      zIndex={1}
      transform={isShown ? "translate(-100%, 0px)" : ""}
      transition="transform 0.4s ease-in-out"
      {...rest}
    >
      <Header blockchain={blockchain} onLastStepClick={onLastStepClick} />
      {children}
    </Box>
  );
};

export default InnerPage;
