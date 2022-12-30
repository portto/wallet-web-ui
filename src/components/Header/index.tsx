import { Box, Flex, keyframes, useBreakpointValue } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { ReactComponent as ArrowBack } from "src/images/icons/arrow-back.svg";
import { ReactComponent as CloseIcon } from "src/images/icons/close.svg";
import { IS_LOCAL, IS_STAGING } from "src/services/Env";

const PADDING_HORIZONTAL = 8;

export enum Blockchain {
  FLOW = "Flow",
  ETHEREUM = "Ethereum",
  RINKEBY = "Rinkeby",
  BNB_MAINNET = "BNB Mainnet",
  BNB_TESTNET = "BNB Testnet",
  POLYGON = "Polygon",
  MUMBAI = "Mumbai",
  AVALANCHE = "Avalanche",
  FUJI = "Fuji",
  SOLANA_MAINNET = "Solana",
  SOLANA_DEVNET = "Solana Devnet",
  APTOS_MAINNET = "Aptos",
  APTOS_TESTNET = "Aptos Testnet",
}

const NetworkLabel = ({ blockchain }: { blockchain: Blockchain }) => {
  const chainRef = useRef<HTMLDivElement>(null);
  const envRef = useRef<HTMLDivElement>(null);
  const [chainWidth, setChainWidth] = useState(0);
  const [envWidth, setEnvWidth] = useState(0);
  const [tagAnimation, setTagAnimation] = useState<string>("");

  const extendAndThenCollapse = keyframes`
    from { padding-right: 0; }
    25%{padding-right: ${chainWidth + PADDING_HORIZONTAL}px;}
    75%{padding-right: ${chainWidth + PADDING_HORIZONTAL}px;}
    to {  padding-right: 0; }
  `;

  const tagAnimationVariant = useBreakpointValue(
    { base: `${extendAndThenCollapse} 4s forwards`, md: "" },
    { ssr: false }
  );

  useEffect(() => {
    if (!chainRef?.current?.offsetWidth || !envRef?.current?.offsetWidth)
      return;
    setChainWidth(chainRef?.current?.offsetWidth);
    setEnvWidth(envRef?.current?.offsetWidth);
  }, []);

  const onTagClick = () => {
    if (!tagAnimationVariant || !!tagAnimation) return;

    setTagAnimation(tagAnimationVariant);

    const timer = setTimeout(() => {
      setTagAnimation("");
      clearTimeout(timer);
    }, 4000);
  };

  if (IS_STAGING || IS_LOCAL) {
    return (
      <Box
        as="button"
        cursor="auto"
        bg="status.warning.light"
        color="status.warning.dark"
        borderRadius="20px"
        fontSize="size.subheading.3"
        fontWeight="weight.m"
        overflow="hidden"
        paddingRight={0}
        _hover={{
          md: { paddingRight: `${chainWidth + PADDING_HORIZONTAL}px` },
        }}
        transition="padding-right 0.3s ease-in-out"
        pos="relative"
        userSelect="none"
        onClick={onTagClick}
        {...(!!tagAnimation && { animation: tagAnimation })}
      >
        <Box py="space.4xs" px={`${PADDING_HORIZONTAL}px`} ref={envRef}>
          DEV
        </Box>
        <Box
          ref={chainRef}
          as="span"
          pos="absolute"
          left={`${envWidth}px`}
          top="space.4xs"
          textTransform="capitalize"
        >
          ({blockchain})
        </Box>
      </Box>
    );

    // TODO: add condition about staging env.
    //   if () {
    //     return <Label>STAGING</Label>;
    //   }
  }

  return null;
};

const Header = ({
  onClose,
  onLastStepClick,
  blockchain,
}: {
  onClose?: () => void;
  onLastStepClick?: () => void;
  blockchain: Blockchain;
}) => {
  return (
    <Flex
      px="space.l"
      py="space.m"
      justifyContent="space-between"
      alignItems="center"
    >
      <Flex alignItems="center">
        {onLastStepClick && (
          <Box mr="space.s">
            <ArrowBack
              onClick={onLastStepClick}
              width="space.l"
              height="space.l"
              cursor="pointer"
            />
          </Box>
        )}
        <NetworkLabel blockchain={blockchain} />
      </Flex>
      {onClose && (
        <Box ml="auto" cursor="pointer" onClick={onClose}>
          <CloseIcon width="15px" height="15px" />
        </Box>
      )}
    </Flex>
  );
};

export default Header;