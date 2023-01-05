import { Button, ButtonProps } from "@chakra-ui/react";
import { FC } from "react";
import LinearSpinner from "./LinearSpinner";

const CustomButton: FC<{ isLoading?: boolean } & ButtonProps> = ({
  children,
  isLoading,
  onClick,
  ...rest
}) => {
  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    if (!isLoading && onClick) {
      onClick(event);
    }
  };

  return (
    <Button
      variant="primary"
      onClick={handleClick}
      cursor={isLoading ? "not-allowed" : "pointer"}
      {...rest}
    >
      {isLoading ? <LinearSpinner /> : children}
    </Button>
  );
};

export default CustomButton;
