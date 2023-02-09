import { Box, Center, Flex, Text } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { checkPreAuthzQueue, updatePreAuthz } from "src/apis";
import FormattedMessage from "src/components/FormattedMessage";
import Header from "src/components/Header";

import LoadingLogo from "src/components/LoadingLogo";
import { useTransactionMachine } from "src/machines/transaction";
import { Chains } from "src/types";

const Queueing = () => {
  const { context, send } = useTransactionMachine();
  const { blockchain } = context.dapp;
  const [waitingCount, setWaitingCount] = useState(0);
  console.log("waitingCount :", waitingCount);
  const { preauthId = "" } = useParams<{
    preauthId?: string;
  }>();

  const handleApprove = useCallback(() => {
    updatePreAuthz({
      preauthId,
      blockchain: Chains.flow,
      action: "approve",
    });
  }, [preauthId]);

  const handleDecline = useCallback(() => {
    updatePreAuthz({
      preauthId,
      blockchain: Chains.flow,
      action: "decline",
    });
  }, [preauthId]);

  // check queue status
  useEffect(() => {
    const interval = setInterval(() => {
      checkPreAuthzQueue({ preauthId, blockchain }).then(
        ({ queueNumber, readyNumber }) => {
          setWaitingCount(queueNumber - readyNumber);
          if (readyNumber >= queueNumber) {
            handleApprove();
          }
        }
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [send, context, preauthId, blockchain, handleApprove]);

  const handleClose = useCallback(() => {
    handleDecline();
    send("close");
  }, [handleDecline, send]);

  return (
    <Box position="relative">
      <Header blockchain={context.dapp.blockchain} onClose={handleClose} />
      <Box
        position="absolute"
        top="0"
        left="0"
        zIndex={-1}
        width="100%"
        height="100%"
      >
        <Center height="100%">
          <Flex flexDirection="column" alignItems="center">
            <LoadingLogo mb="space.s" />
            <Text
              fontSize="size.heading.4"
              fontWeight="weight.l"
              lineHeight="line.height.subheading.1"
              mb="space.2xs"
            >
              <FormattedMessage intlKey="feature.authn.queue.title" />
            </Text>
            <Text fontSize="size.body.3" textAlign="center">
              <FormattedMessage intlKey="feature.authn.queue.description" />
            </Text>
          </Flex>
        </Center>
      </Box>
    </Box>
  );
};

export default Queueing;
