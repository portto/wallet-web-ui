import { Box, Flex, keyframes } from "@chakra-ui/react";

const bounce = keyframes`
  0%, 80%, 100% {
    transform: scale(0);
  }

  40% {
    transform: scale(1);
  }
`;

const Dot = ({ delayMultiplier = 0 }: { delayMultiplier?: number }) => {
  const animation = `${bounce} 1.4s infinite ${
    delayMultiplier * 0.16
  }s ease-in-out both`;

  return (
    <Box
      width="10px"
      height="10px"
      borderRadius="50%"
      bg="background.primary"
      mr="space.xs"
      _last={{ mr: "0" }}
      animation={animation}
    />
  );
};

const LinearSpinner = () => (
  <Flex justifyContent="center" alignItems="center">
    {Array.from({ length: 3 }).map((_, i) => (
      <Dot key={i} delayMultiplier={i} />
    ))}
  </Flex>
);

export default LinearSpinner;
