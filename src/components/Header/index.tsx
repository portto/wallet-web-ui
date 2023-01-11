import {
  Box,
  Flex,
  FlexProps,
  keyframes,
  useBreakpointValue,
} from "@chakra-ui/react";
import { memo, useEffect, useRef, useState } from "react";
import { ReactComponent as ArrowBack } from "src/assets/images/icons/arrow-back.svg";
import { ReactComponent as CloseIcon } from "src/assets/images/icons/close.svg";
import { IS_LOCAL, IS_STAGING } from "src/services/Env";

const PADDING_HORIZONTAL = 8;

const ChainNameMappingOnProd = {
  flow: "Flow",
  ethereum: "Ethereum",
  bsc: "BNB Mainnet",
  polygon: "Polygon",
  avalanche: "Avalanche",
  solana: "Solana",
  aptos: "Aptos",
};

const ChainNameMappingOnStaging = {
  flow: "Flow Sandboxnet",
  ethereum: "Rinkeby",
  bsc: "BNB Testnet",
  polygon: "Mumbai",
  avalanche: "Fuji",
  solana: "Solana Devnet",
  aptos: "Aptos Testnet",
};

const ChainNameMappingOnDev = {
  flow: "Flow Testnet",
  ethereum: "Rinkeby",
  bsc: "BNB Testnet",
  polygon: "Mumbai",
  avalanche: "Fuji",
  solana: "Solana Devnet",
  aptos: "Aptos Testnet",
};

const NetworkChainNameMapping: Record<string, Record<string, string>> = {
  mainnet: ChainNameMappingOnProd,
  sandboxnet: ChainNameMappingOnStaging,
  testnet: ChainNameMappingOnDev,
};

const NetworkLabel = ({ blockchain }: { blockchain: string }) => {
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
          width="max-content"
          pos="absolute"
          left={`${envWidth}px`}
          top="space.4xs"
          textTransform="capitalize"
        >
          (
          {
            NetworkChainNameMapping[process.env.REACT_APP_NETWORK || "testnet"][
              blockchain
            ]
          }
          )
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

const Header = memo(
  ({
    onClose,
    onLastStepClick,
    blockchain,
    ...props
  }: {
    onClose?: () => void;
    onLastStepClick?: () => void;
    blockchain: string;
  } & FlexProps) => {
    return (
      <Flex
        px="space.l"
        py="space.s"
        justifyContent="space-between"
        alignItems="center"
        {...props}
      >
        <Flex alignItems="center">
          {onLastStepClick && (
            <Box mr="space.s">
              <ArrowBack
                onClick={onLastStepClick}
                width="20px"
                height="20px"
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
  }
);

export default Header;
