import { Box } from "@chakra-ui/react";
import { ReactNode } from "react";

const Layout = ({ children, ...rest }: { children: ReactNode }) => (
  <Box
    pos="fixed"
    top={{ base: "none", md: "50%" }}
    left={{ base: 0, md: "50%" }}
    bottom={{ base: 0, md: "none" }}
    width={400}
    height={{ base: "100%", md: 500 }}
    maxW={{ base: "100vw", md: "90vw" }}
    transform={{ base: "none", md: "translate(-50%, -50%)" }}
    maxH={650}
    display="flex"
    flexDir="column"
    bg="white"
    borderWidth={2}
    borderColor="accent.border"
    borderTopRadius={20}
    borderBottomRadius={{ base: 0, md: 20 }}
    boxShadow="0 0 20px 0 rgba(0, 0, 0, 0.2)"
    overflow="hidden"
    transition=".2s width, .2s height"
    {...rest}
  >
    {children}
  </Box>
);

export default Layout;
