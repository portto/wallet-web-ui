import { Box, FlexProps } from "@chakra-ui/react";
import { FC } from "react";

export type LayoutSizeType = "sm" | "md" | "lg";

const LAYOUT_SIZE: Record<LayoutSizeType, string> = {
  sm: "390px",
  md: "444px",
  lg: "584px",
};

const Layout: FC<{ size?: LayoutSizeType } & FlexProps> = ({
  size = "sm",
  children,
  ...rest
}) => (
  <Box
    pos="fixed"
    top={{ sm: "50%" }}
    left={{ base: 0, sm: "50%" }}
    bottom={{ base: 0, sm: "unset" }}
    width={{ base: "100vw", sm: "375px" }}
    height={{ base: "100%", md: LAYOUT_SIZE[size] }}
    maxH="584px"
    transform={{ base: "none", sm: "translate(-50%, -50%)" }}
    display="flex"
    flexDir="column"
    bg="background.primary"
    borderWidth={2}
    borderColor="status.warning.light"
    borderBottomWidth={{ base: 0, sm: "2px" }}
    borderTopRadius="12px"
    borderBottomRadius={{ base: 0, sm: "12px" }}
    boxShadow="0 0 20px 0 rgba(0, 0, 0, 0.2)"
    overflow="hidden"
    transition=".2s width, .2s height"
    __css={{
      "> div:last-child": { flex: 1 },
    }}
    {...rest}
  >
    {children}
  </Box>
);

export default Layout;
