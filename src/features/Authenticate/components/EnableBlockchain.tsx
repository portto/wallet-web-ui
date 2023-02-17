import { Center, Button as ChakraButton, Flex, Text } from "@chakra-ui/react";
import * as fcl from "@onflow/fcl";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  createSharedAccount,
  enableBlockchain,
  estimateEnableBlockchain,
  getAccountAssets,
} from "src/apis";
import Button from "src/components/Button";
import FormattedMessage from "src/components/FormattedMessage";
import Header from "src/components/Header";
import LoadingLogo from "src/components/LoadingLogo";
import { useAuthenticateMachine } from "src/machines/authenticate";
import { logSendTx } from "src/services/Amplitude";
import { getLockedAddress } from "src/services/Flow";
import { AssetStatus, Chains } from "src/types";
import getBlockchainStatus from "src/utils/getBlockchainStatus";
import mapAssetsToAddresses from "src/utils/mapAssetsToAddresses";

const OPEN_APP_LINK =
  process.env.REACT_APP_NETWORK === "mainnet"
    ? "https://blocto-alternate.app.link"
    : "https://blocto-alternate.test-app.link";

const ACCOUNT_POLLING_INTERVAL = 2000;

const EnableBlockchain = () => {
  const timerRef = useRef<NodeJS.Timeout>();
  const { context, send } = useAuthenticateMachine();
  const [isEnough, setIsEnough] = useState(true);

  const { blockchain, id = "", url = "", name = "" } = context.dapp;
  const { points = 0 } = context.user;
  const domain = url ? new URL(url).host : "";

  const getWalletStatus = async (
    resolve: (value: { [k: string]: string }) => void
  ) => {
    const { assets } = await getAccountAssets();
    const status = getBlockchainStatus(assets, blockchain);

    if (status !== AssetStatus.CONFIRMED) {
      timerRef.current = setTimeout(
        () => getWalletStatus(resolve),
        ACCOUNT_POLLING_INTERVAL
      );
    } else {
      const addresses = mapAssetsToAddresses(assets);
      resolve(addresses);
    }
  };

  const pollWalletStatus = () => new Promise(getWalletStatus);

  const handleCreateSharedAccount = async (addresses: {
    [k: string]: string;
  }) => {
    try {
      const { tx_hash } = await createSharedAccount();
      logSendTx({
        domain,
        chain: blockchain,
        dAppName: name,
        dAppId: id,
      });
      await fcl.tx(tx_hash).onceExecuted();
    } finally {
      send({ type: "done", data: { addresses } });
    }
  };

  const postCreation = (addresses: { [k: string]: string }) => {
    // if shouldn't check, assume locked address created
    const maybeGetLockedAddress =
      domain === "port.onflow.org" && blockchain === Chains.flow
        ? getLockedAddress // post-creation setup for flow accounts
        : () => Promise.resolve();

    const flowAddress = addresses[blockchain];
    maybeGetLockedAddress(flowAddress)
      .then(() => send({ type: "done", data: { addresses } }))
      // cannot find locked address, run create shared account script
      .catch(() => {
        handleCreateSharedAccount(addresses);
      });
  };

  const tryEnable = async () => {
    const { point_cost, point_discount } = await estimateEnableBlockchain({
      blockchain,
    });
    const pointCost = parseInt(point_cost, 10);
    if (pointCost <= points) {
      await enableBlockchain({
        pointCost: pointCost.toString(),
        pointDiscount: point_discount,
        blockchain,
      });

      const addresses = await pollWalletStatus();
      postCreation(addresses);
    } else {
      setIsEnough(false);
    }
  };

  const checkAndEnableWallet = async () => {
    const { assets } = await getAccountAssets();
    const status = getBlockchainStatus(assets, blockchain);
    if (status === AssetStatus.UNCREATED) {
      tryEnable();
    } else {
      // User already has the wallet created. Just need to wait for it to be created.
      pollWalletStatus();
    }
  };

  useEffect(() => {
    // First check whether we need to create the wallet for the user
    checkAndEnableWallet();
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const switchAccount = useCallback(async () => {
    send("switchAccount");
  }, [send]);

  const redirect = () => {
    window.open(OPEN_APP_LINK);
  };

  const handleClose = useCallback(() => send("close"), [send]);

  return (
    <>
      <Header blockchain={context.dapp.blockchain} onClose={handleClose} />
      <Flex
        flexDirection="column"
        justifyContent="space-between"
        px="space.l"
        textAlign="center"
      >
        <Center height="100%">
          <Flex flexDirection="column" alignItems="center">
            <LoadingLogo
              src={context.blockchainIcon}
              width="48px"
              height="48px"
              mb="space.s"
            />
            <Text
              fontSize="size.heading.4"
              fontWeight="weight.l"
              lineHeight="line.height.subheading.1"
              mb="space.2xs"
            >
              <FormattedMessage
                intlKey={
                  isEnough
                    ? "feature.authn.enable.title"
                    : "feature.authn.insufficientEnable.title"
                }
                values={{
                  chain:
                    blockchain.charAt(0).toUpperCase() + blockchain.slice(1),
                }}
              />
            </Text>
            <Text fontSize="size.body.3" textAlign="center">
              <FormattedMessage
                intlKey={
                  isEnough
                    ? "app.general.itTakesSomeTimeToProceed"
                    : "feature.authn.insufficientEnable.description"
                }
              />
            </Text>
          </Flex>
        </Center>
        {!isEnough && (
          <Button onClick={redirect}>
            <FormattedMessage intlKey="app.general.downloadBloctoApp" />
          </Button>
        )}
        <ChakraButton
          onClick={switchAccount}
          flex="1 0 auto"
          width="100%"
          height="38px"
          my="space.2xs"
          bg="background.primary"
          color="font.highlight"
          fontSize="size.body.2"
          fontWeight="weight.s"
          _hover={{ bg: "none", transform: "scale(0.98)" }}
          _active={{ bg: "none", transform: "scale(0.96)" }}
        >
          <FormattedMessage intlKey="feature.authn.confirm.useAnotherAccount" />
        </ChakraButton>
      </Flex>
    </>
  );
};

export default EnableBlockchain;
