import { Box } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import {
  enableBlockchain,
  estimateEnableBlockchain,
  getAccountAssets,
} from "src/apis";
import { useAuthenticateMachine } from "src/machines/authenticate";
import checkBlockchainEnabled from "src/utils/checkBlockchainEnabled";

const ACCOUNT_POLLING_INTERVAL = 2000;

const EnableBlockchain = () => {
  const { context, send } = useAuthenticateMachine();
  const [ableToEnable, setAbleToEnable] = useState(true);

  const { blockchain } = context.dapp;
  const { points = 0 } = context.user;

  // try auto enable chain for user
  useEffect(() => {
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
        // post-creation setup for flow accounts
        if (blockchain === "flow") {
          // @todo: implementation
        }
      } else {
        setAbleToEnable(false);
      }
    };
    tryEnable();
  }, [blockchain, points]);

  // polling until corresponding assets found created
  useEffect(() => {
    const interval = setInterval(() => {
      getAccountAssets().then(({ assets }) => {
        const enabled = checkBlockchainEnabled(assets, blockchain);
        if (enabled) {
          send({ type: "done", data: { assets } });
        }
      });
    }, ACCOUNT_POLLING_INTERVAL);
    return () => clearInterval(interval);
  }, [blockchain]);

  return (
    <Box>
      {ableToEnable ? "Enabling blockchain" : "Enable Blockchain in App"}
    </Box>
  );
};

export default EnableBlockchain;
