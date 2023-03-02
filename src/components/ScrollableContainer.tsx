import { Box, BoxProps, Flex } from "@chakra-ui/react";
import { ReactNode, useEffect, useRef, useState } from "react";

const ScrollableContainer = ({
  children,
  attachShadow = false,
  ...restProps
}: {
  children: ReactNode;
  attachShadow?: boolean;
} & BoxProps) => {
  const [hasShadow, setHasShadow] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    const container = containerRef.current;
    const hasShadow =
      !!container &&
      container.scrollTop + container.clientHeight < container.scrollHeight;

    setHasShadow(hasShadow);
  };

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <Flex overflow="hidden">
      <Box
        ref={containerRef}
        h="100%"
        w="100%"
        overflowY="auto"
        pb="space.4xl"
        boxShadow={
          attachShadow && hasShadow
            ? "inset 0 -10px 10px -10px rgb(35 37 40 / 5%)"
            : ""
        }
        {...restProps}
      >
        {children}
      </Box>
    </Flex>
  );
};
export default ScrollableContainer;
