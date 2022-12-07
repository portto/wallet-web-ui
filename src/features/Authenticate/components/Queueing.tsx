import { Box } from "@chakra-ui/react";
import { getAuthnQueue } from "apis";
import { useAuthenticateMachine } from "machines/authenticate";
import { useEffect } from "react";

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
      getAuthnQueue(queueId).then(({ queueNumber, readyNumber }) =>
        readyNumber >= queueNumber ? send("ready") : null
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [send, context.queue]);

  return <Box>Queueing</Box>;
};

export default Queueing;
