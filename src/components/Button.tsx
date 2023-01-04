import { Button, ButtonProps } from "@chakra-ui/react";
import { FC } from "react";
import LinearSpinner from "./LinearSpinner";

const CustomButton: FC<{ isLoading?: boolean } & ButtonProps> = ({
  children,
  isLoading,
  ...rest
}) => {
  return (
    <Button variant="primary" {...rest}>
      {isLoading ? <LinearSpinner /> : children}
    </Button>
  );
};

export default CustomButton;
