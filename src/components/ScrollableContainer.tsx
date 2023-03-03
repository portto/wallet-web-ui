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
  const [isScrollable, setIsScrollable] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const container = containerRef.current;

  useEffect(() => {
    if (!container) return;

    const isScrollable = container.scrollHeight > container.clientHeight;

    setIsScrollable(isScrollable);
  }, [container]);

  return (
    <Flex overflow="hidden">
      <Box
        ref={containerRef}
        h="100%"
        w="100%"
        overflowY="auto"
        pb="space.4xl"
        boxShadow={
          attachShadow && isScrollable
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
