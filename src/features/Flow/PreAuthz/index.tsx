import { Box, Center, Flex, Text } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { checkPreAuthzQueue, updatePreAuthz } from "src/apis";
import FormattedMessage from "src/components/FormattedMessage";
import Header from "src/components/Header";
import LoadingLogo from "src/components/LoadingLogo";
import { Chains } from "src/types";

const PreAuthz = () => {
  const [waitingCount, setWaitingCount] = useState(0);
  const location = useLocation();
  const search = new URLSearchParams(location.search);
  const preauthId = search.get("preauthId") || "";
  const { blockchain, appId } = useParams<{
    appId?: string;
    blockchain: Chains;
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
  }, [preauthId, blockchain, handleApprove, appId]);

  return (
    <Box position="relative">
      <Header blockchain={blockchain} onClose={handleDecline} />
      <Box position="absolute" top="0" left="0" width="100%" height="100%">
        <Center height="100%">
          <Flex flexDirection="column" alignItems="center" px="space.l">
            <LoadingLogo mb="space.s" />
            <Text
              fontSize="size.heading.4"
              fontWeight="weight.l"
              lineHeight="line.height.subheading.1"
              textAlign="center"
              mb="space.2xs"
            >
              <FormattedMessage intlKey="feature.preAuthz.queue.title" />
            </Text>
            <Text fontSize="size.body.3" textAlign="center">
              <FormattedMessage
                intlKey="feature.preAuthz.queue.description"
                values={{ count: waitingCount }}
              />
            </Text>
          </Flex>
        </Center>
      </Box>
    </Box>
  );
};

export default PreAuthz;
