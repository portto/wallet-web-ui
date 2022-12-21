import { Box, Input } from "@chakra-ui/react";
import { useAuthenticateMachine } from "machines/authenticate";
import { useEffect, useState } from "react";
import { logLogin } from "services/Amplitude";
import loginAndAcquireToken from "utils/loginAndAcquireToken";

const Input2FA = () => {
  const { context, send } = useAuthenticateMachine();

  const [input, setInput] = useState("");

  // check 2FA when input changed
  useEffect(() => {
    const { user, dapp } = context;
    const { email, authCode, authCodeId } = user;
    const { id: dAppId = "", url = "", name: dAppName = "", blockchain } = dapp;

    const domain = new URL(url).host;

    if (user.accessToken && user.deviceKey && input.length !== 6) return;
    
    loginAndAcquireToken({
      email,
      auth_code: authCode,
      auth_code_id: authCodeId,
      totp: input,
      chain: blockchain,
    }).then(({ jwt, key }) => {
      logLogin({ chain: blockchain, domain, dAppName, dAppId });
      send({
        type: "next",
        data: { accessToken: jwt, deviceKey: key },
      });
    });
  }, [send, input, context]);

  return (
    <Box>
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Input 2FA"
      />
    </Box>
  );
};

export default Input2FA;
