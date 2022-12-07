import { Box, Button, Text } from "@chakra-ui/react";
import { createHandshake } from "apis";
import { useCallback } from "react";
import { logAuthenticated } from "services/Amplitude";
import { useAuthenticateMachine } from "machines/authenticate";
import { KEY_ACCESS_TOKEN, KEY_DEVICE_KEY, KEY_EMAIL, KEY_SESSION_ID, KEY_USER_ID, KEY_USER_TYPE, removeItem, setItem } from "services/LocalStorage";

const AccountConifrm = () => {
  const { context, send } = useAuthenticateMachine();

  const approve = useCallback(async () => {
    const {
      id: userId,
      email,
      type: userType,
      addresses,
      deviceKey,
      signatureData,
    } = context.user;
    const {
      id: dAppId = "",
      name: dAppName = "",
      logo,
      url = "",
      chain: blockchain,
    } = context.dapp;

    const domain = new URL(url).host;
    // create session with api server
    const handshakeData = await createHandshake({
      blockchain,
      email,
      userId,
      address: addresses,
      domain,
      appId: dAppId,
      userType,
      metadata: {
        title: dAppName,
        thumbnail: logo,
      },
      deviceKey,
      signatureData,
    });
    const { paddr, code, signatures = [] } = handshakeData;
    setItem(KEY_SESSION_ID, code);

    // log authenticated event
    logAuthenticated({ chain: blockchain, domain, dAppName, dAppId });

    send({
      type: userType === "normal" ? "approve" : "nonCustodialApprove",
      data: {
        accountInfo: {
          paddr,
          code,
        },
        signatures,
      },
    });
  }, []);

  const switchAccount = useCallback(async () => {
    removeItem(KEY_ACCESS_TOKEN);
    removeItem(KEY_DEVICE_KEY);
    removeItem(KEY_EMAIL);
    removeItem(KEY_SESSION_ID);
    removeItem(KEY_USER_ID);
    removeItem(KEY_USER_TYPE);
    send("switchAccount");
  }, []);

  return (
    <Box>
      <Text>Account Confirm</Text>
      <Button onClick={approve}>Approve</Button>
      <Button onClick={switchAccount}>Switch Account</Button>
    </Box>
  );
};

export default AccountConifrm;
