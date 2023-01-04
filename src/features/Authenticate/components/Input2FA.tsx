import { Box, Input } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useAuthenticateMachine } from "src/machines/authenticate";
import { logLogin } from "src/services/Amplitude";
import loginAndAcquireToken from "src/utils/loginAndAcquireToken";

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
      email: email || "",
      authCode: authCode || "",
      authCodeId: authCodeId || "",
      totpCode: input || "",
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
