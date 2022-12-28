import { Box } from "@chakra-ui/react";
import { useEffect } from "react";
import { getAuthnQueue } from "src/apis";
import { useAuthenticateMachine } from "src/machines/authenticate";

const Queueing = () => {
  const { context, send } = useAuthenticateMachine();

  // check queue status
  useEffect(() => {
    const {
      queueNumber = 0,
      readyNumber = 0,
      queueId = 0,
    } = context.queue || {};
    if (readyNumber >= queueNumber) {
      send("ready");
    }
    const interval = setInterval(() => {
      getAuthnQueue(queueId).then(
        ({
          queueNumber: updatedQueueNumber,
          readyNumber: updatedReadyNumber,
        }) => (updatedReadyNumber >= updatedQueueNumber ? send("ready") : null)
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [send, context.queue]);

  return <Box>Queueing</Box>;
};

export default Queueing;
