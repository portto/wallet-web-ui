import { Flex, HTMLChakraProps } from "@chakra-ui/react";
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
    <Flex
      flexDirection="column"
      width="100%"
      height="100%"
      bg="background.primary"
      position="absolute"
      top={0}
      left="100%"
      zIndex={1}
      transform={isShown ? "translate(-100%, 0px)" : ""}
      transition="transform 0.4s ease-in-out"
      {...rest}
    >
      <Header blockchain={blockchain} onLastStepClick={onLastStepClick} />
      {children}
    </Flex>
  );
};

export default InnerPage;
