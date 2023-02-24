import { Box, BoxProps } from "@chakra-ui/react";
import { ReactNode, useEffect, useRef, useState } from "react";

const ScrollableContainer = ({
  children,
  maxH,
  attachShadow = false,
  ...restProps
}: {
  children: ReactNode;
  maxH: string;
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
    if (container) {
      container.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  return (
    <Box
      ref={containerRef}
      maxH={maxH}
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
  );
};
export default ScrollableContainer;
