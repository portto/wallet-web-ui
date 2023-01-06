import { Box, Flex, PinInput, PinInputField, Text } from "@chakra-ui/react";
import { useState } from "react";
import { FormattedMessage } from "react-intl";
import Button from "src/components/Button";
import Header from "src/components/Header";
import LoadingLogo from "src/components/LoadingLogo";
import { useAuthenticateMachine } from "src/machines/authenticate";
import { logLogin } from "src/services/Amplitude";
import loginAndAcquireToken from "src/utils/loginAndAcquireToken";

const Input2FA = () => {
  const { context, send } = useAuthenticateMachine();
  const [input, setInput] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isWrongCode, setIsWrongCode] = useState(false);
  const {
    user: { email, authCode, authCodeId },
    dapp: { id: dAppId = "", url = "", name: dAppName = "", blockchain },
  } = context;

  const handleChange = (value: string) => {
    setInput(value);
    if (!value) {
      setIsWrongCode(false);
    }
  };

  const handleSubmit = () => {
    if (
      (context.user.accessToken && context.user.deviceKey) ||
      !email ||
      !authCode ||
      !authCodeId
    ) {
      return setIsWrongCode(true);
    }

    setHasSubmitted(true);
    loginAndAcquireToken({
      email,
      authCode,
      authCodeId,
      totpCode: input,
      chain: blockchain,
    })
      .then(({ jwt, key }) => {
        logLogin({
          chain: blockchain,
          domain: url ? new URL(url).host : "",
          dAppName,
          dAppId,
        });
        send({
          type: "next",
          data: { accessToken: jwt, deviceKey: key },
        });
      })
      .catch(() => {
        setIsWrongCode(true);
        setHasSubmitted(false);
      });
  };

  const handleGoBack = () => send("back");

  const handleClose = () => send("close");

  return (
    <>
      <Header
        bg="background.secondary"
        blockchain={blockchain}
        onLastStepClick={handleGoBack}
        onClose={handleClose}
      />
      <Flex
        flexDirection="column"
        justifyContent="space-between"
        px="space.l"
        pb="space.m"
        bg="background.secondary"
      >
        <Flex flexDirection="column" alignItems="center">
          <LoadingLogo mb="space.s" />
          <Text
            fontSize="size.heading.4"
            fontWeight="weight.l"
            lineHeight="line.height.subheading.1"
          >
            <FormattedMessage id="feature.authn.2fa.title" />
          </Text>
          <Text fontSize="size.body.3" textAlign="center" my="space.2xs">
            <FormattedMessage id="feature.authn.2fa.description" />
          </Text>
        </Flex>

        <Box>
          <Flex justifyContent="space-between" mb="space.xl">
            <PinInput
              otp
              autoFocus
              placeholder=""
              onChange={handleChange}
              isInvalid={isWrongCode}
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <PinInputField key={i} />
              ))}
            </PinInput>
          </Flex>

          <Button
            isLoading={hasSubmitted}
            disabled={input.length !== 6}
            onClick={handleSubmit}
          >
            <FormattedMessage id="app.genaral.approve" />
          </Button>
        </Box>
      </Flex>
    </>
  );
};

export default Input2FA;
