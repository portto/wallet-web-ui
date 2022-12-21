import { Box, Input } from "@chakra-ui/react";
import { register } from "apis";
import { useAuthenticateMachine } from "machines/authenticate";
import { useEffect, useState } from "react";
import { logLogin, logRegister } from "services/Amplitude";
import loginAndAcquireToken from "utils/loginAndAcquireToken";

const InputOTP = () => {
  const { context, send } = useAuthenticateMachine();

  const [input, setInput] = useState("");

  // check OTP when input changed
  useEffect(() => {
    const { user, dapp } = context;
    const { action, email, authCode, authCodeId = "" } = user;
    const { id = "", blockchain, url = "", name: dAppName = "" } = dapp;
    const domain = new URL(url).host;

    const isFlow = blockchain === "flow";
    if (user.accessToken || authCode || input.length !== 6) return;

    const authenticate = () =>
      action === "register"
        ? register({
          appId: id,
          email: email?.toLowerCase() || "",
          authCode: input,
          authCodeId,
          // flow is the default option in the pre-enable list
          blockchains: isFlow ? ["flow"] : [blockchain, "flow"],
        })
        : loginAndAcquireToken({
          email,
          authCode: input,
          authCodeId,
          chain: blockchain,
        });

    authenticate()
      .then(({ jwt, key }) => {
        const logAction = action === "register" ? logRegister : logLogin;
        logAction({ domain, chain: blockchain, dAppName, dAppId: id });

        send({
          type: "next",
          data: { accessToken: jwt, deviceKey: key },
        });
      })
      .catch((err: any) => {
        if (err?.response?.error_code === "2fa_required") {
          send({
            type: "require2fa",
            data: { authCode: input },
          });
        }
      });
  }, [send, input, context]);

  return (
    <Box>
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Input OTP"
      />
    </Box>
  );
};

export default InputOTP;
