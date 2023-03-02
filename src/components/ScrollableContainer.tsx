import { Box, BoxProps, Flex } from "@chakra-ui/react";
import debounce from "lodash/debounce";
import { ReactNode, useCallback, useEffect, useRef, useState } from "react";

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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleScroll = useCallback(
    debounce(() => {
      const container = containerRef.current;

      if (!container) return;

      const atBottom =
        Math.abs(
          container.scrollHeight - container.clientHeight - container.scrollTop
        ) < 1;

      setHasShadow(!atBottom);
    }, 100),
    []
  );

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

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
