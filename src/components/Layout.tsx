import { Box, FlexProps } from "@chakra-ui/react";
import { FC } from "react";

const Layout: FC<{ isCompact?: boolean } & FlexProps> = ({
  isCompact = true,
  children,
  ...rest
}) => (
  <Box
    pos="fixed"
    top={{ md: "50%" }}
    left={{ base: 0, md: "50%" }}
    bottom={{ base: 0, md: "unset" }}
    width={{ base: "100vw", md: "375px" }}
    height={{ base: "100%", md: isCompact ? "390px" : "584px" }}
    maxH="580px"
    transform={{ base: "none", md: "translate(-50%, -50%)" }}
    display="flex"
    flexDir="column"
    bg="background.primary"
    borderWidth={2}
    borderColor="status.warning.light"
    borderBottomWidth={{ base: 0, md: "2px" }}
    borderTopRadius="12px"
    borderBottomRadius={{ base: 0, md: "12px" }}
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
