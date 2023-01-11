import {
  Box,
  Flex,
  Image,
  PinInput,
  PinInputField,
  Text,
} from "@chakra-ui/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { FormattedMessage, defineMessages } from "react-intl";
import { register, requestEmailAuth } from "src/apis";
import switchAccountIcon from "src/assets/images/icons/switch.svg";
import Button from "src/components/Button";
import Header from "src/components/Header";
import LoadingLogo from "src/components/LoadingLogo";
import { useAuthenticateMachine } from "src/machines/authenticate";
import { logLogin, logRegister } from "src/services/Amplitude";
import loginAndAcquireToken from "src/utils/loginAndAcquireToken";

const messages = defineMessages({
  title: {
    id: "feature.authn.otp.title",
    defaultMessage: "Passcode",
  },
  description: {
    id: "feature.authn.otp.description",
    defaultMessage: "We have sent a 6-digit code to your email",
  },
  resend: {
    id: "feature.authn.otp.resend",
    defaultMessage: "Resend",
  },
});

const COOLDOWN_TIME = 60;

const InputOTP = () => {
  const timerRef = useRef<NodeJS.Timer>();
  const { context, send } = useAuthenticateMachine();
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [cooldown, setCooldown] = useState(COOLDOWN_TIME);
  const [isWrongCode, setIsWrongCode] = useState(false);

  const {
    user: { action, email, authCode, authCodeId = "" },
    dapp: { id = "", blockchain, url = "", name: dAppName = "" },
  } = context;

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (cooldown === COOLDOWN_TIME && !timerRef.current) {
      timerRef.current = setInterval(() => {
        setCooldown((prevCooldown) => {
          if (prevCooldown === 1) {
            clearInterval(timerRef.current);
            timerRef.current = undefined;
          }
          return prevCooldown - 1;
        });
      }, 1000);
    }
  }, [cooldown]);

  const handleChange = (value: string) => {
    if (!value) {
      setIsWrongCode(false);
    }
  };

  const handleSubmit = (inputValue: string) => {
    if (context.user.accessToken || authCode || !email) {
      return setIsWrongCode(true);
    }

    setHasSubmitted(true);
    const authenticate = () =>
      action === "register"
        ? register({
            appId: id,
            email: email.toLowerCase(),
            authCode: inputValue,
            authCodeId,
            // flow is the default option in the pre-enable list
            blockchains:
              blockchain === "flow" ? ["flow"] : [blockchain, "flow"],
          })
        : loginAndAcquireToken({
            email,
            authCode: inputValue,
            authCodeId,
            chain: blockchain,
          });

    authenticate()
      .then(({ jwt, key }) => {
        const logAction = action === "register" ? logRegister : logLogin;
        logAction({
          domain: url ? new URL(url).host : "",
          chain: blockchain,
          dAppName,
          dAppId: id,
        });

        send({
          type: "next",
          data: { accessToken: jwt, deviceKey: key },
        });
      })
      .catch((err) => {
        if (err?.response?.data?.error_code === "2fa_required") {
          send({
            type: "require2fa",
            data: { authCode: inputValue },
          });
        } else {
          setIsWrongCode(true);
          setHasSubmitted(false);
        }
      });
  };

  const switchAccount = () => {
    send("back");
  };

  const handleResend = () => {
    setCooldown(COOLDOWN_TIME);

    requestEmailAuth({ action, email }).then(({ id }) => {
      if (id) {
        send({ type: "renewOTPCode", data: { authCodeId: id } });
      }
    });
  };

  const handleGoBack = useCallback(() => send("back"), [send]);

  const handleClose = useCallback(() => send("close"), [send]);

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
            <FormattedMessage {...messages.title} />
          </Text>
          <Text fontSize="size.body.3" textAlign="center" my="space.2xs">
            <FormattedMessage {...messages.description} />
          </Text>
          <Text
            display="flex"
            alignItems="center"
            px="space.m"
            py="space.3xs"
            fontSize="size.subheading.2"
            fontWeight="weight.m"
            lineHeight="line.height.subheading.2"
            bg="background.primary"
            borderRadius="32px"
            cursor="pointer"
            onClick={switchAccount}
          >
            {email}
            <Image src={switchAccountIcon} ml="space.2xs" />
          </Text>
        </Flex>

        <Box>
          <Flex justifyContent="space-between" mb="space.m">
            <PinInput
              otp
              autoFocus
              placeholder=""
              onChange={handleChange}
              onComplete={handleSubmit}
              isInvalid={isWrongCode}
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <PinInputField key={i} />
              ))}
            </PinInput>
          </Flex>

          <Button
            isLoading={hasSubmitted}
            disabled={!!cooldown}
            onClick={handleResend}
          >
            <FormattedMessage {...messages.resend} />
            {!!cooldown && ` (${cooldown})`}
          </Button>
        </Box>
      </Flex>
    </>
  );
};

export default InputOTP;
