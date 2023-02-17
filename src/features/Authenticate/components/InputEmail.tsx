import {
  Box,
  Flex,
  Image,
  Input,
  InputGroup,
  InputRightElement,
  Link,
  Text,
  keyframes,
} from "@chakra-ui/react";
import debounce from "lodash/debounce";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { checkEmailExist, requestEmailAuth } from "src/apis";
import check from "src/assets/images/icons/check.svg";
import error from "src/assets/images/icons/error.svg";
import inputLoading from "src/assets/images/icons/input-loading.svg";
import Button from "src/components/Button";
import DappLogo from "src/components/DappLogo";
import FormattedMessage from "src/components/FormattedMessage";
import Header from "src/components/Header";
import { useLayoutContext } from "src/context/layout";
import { useAuthenticateMachine } from "src/machines/authenticate";
import checkEmailFormat from "src/utils/checkEmailFormat";

const rotate = keyframes`
from { transform: rotate(0); }
to { transform: rotate(360deg); }
`;

const rotateAnimation = `${rotate} 1.5s linear infinite`;

const InputEmail = () => {
  const { send, context } = useAuthenticateMachine();
  const [input, setInput] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [isEmailExistent, setIsEmailExistent] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const { setLayoutSize } = useLayoutContext();
  const {
    user: { action },
    dapp: { name, blockchain, logo },
  } = context;
  const isRegistering = input && !hasError && !isChecking && !isEmailExistent;

  useEffect(() => {
    if (setLayoutSize) setLayoutSize(isRegistering || hasError ? "md" : "sm");
  }, [isRegistering, hasError, setLayoutSize]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const checkEmail = useCallback(
    debounce((email) => {
      if (!email || !checkEmailFormat(email)) {
        setIsChecking(false);
        setHasError(!!email);
        return;
      }

      setHasError(false);
      checkEmailExist(email).then(({ exist }) => {
        setIsChecking(false);
        setIsEmailExistent(exist);
        send({
          type: "updateUser",
          data: { action: exist ? "login" : "register" },
        });
      });
    }, 500),
    []
  );

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    setInput(event.target.value);
    setIsChecking(!!event.target.value);
    checkEmail(event.target.value);
  };

  const onConfirm = useCallback(async () => {
    setHasSubmitted(true);
    const email = input;
    // get auth code id
    const { id } = await requestEmailAuth({ action, email });
    if (id) {
      send({ type: "confirm", data: { email, authCodeId: id } });
    }
  }, [send, input, action]);

  const handleKeyUp: React.KeyboardEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      // Handle press enter to submit
      if (event.keyCode === 13 || event.key === "Enter") {
        if (input && !isChecking && !hasError && !hasSubmitted) {
          onConfirm();
        }
      }
    },
    [hasError, hasSubmitted, input, isChecking, onConfirm]
  );

  const handleClose = useCallback(() => send("close"), [send]);

  const clearInput = () => {
    setInput("");
    setIsChecking(false);
    setHasError(false);
  };

  const renderButtonText = () => {
    if (isChecking || !input) {
      return <FormattedMessage intlKey="feature.authn.signInOrRegister" />;
    }
    if (isEmailExistent) {
      return <FormattedMessage intlKey="feature.authn.signIn.submit" />;
    }
    return <FormattedMessage intlKey="feature.authn.register.submit" />;
  };

  const renderInputIcon = () => {
    if (isChecking) {
      return <Image src={inputLoading} animation={rotateAnimation} />;
    }
    if (hasError) {
      return (
        <Button
          onClick={clearInput}
          minWidth="max-content"
          p="0"
          borderRadius="0"
          bg="none"
          _hover={{}}
          _active={{}}
        >
          <Image src={error} />
        </Button>
      );
    }
    return input && <Image src={check} />;
  };

  return (
    <>
      <Header
        bg="background.secondary"
        blockchain={blockchain}
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
          <DappLogo url={logo || ""} mb="space.s" />
          <Text
            fontSize="size.heading.4"
            fontWeight="weight.l"
            lineHeight="line.height.subheading.1"
          >
            <FormattedMessage intlKey="feature.authn.signIn.title" />
          </Text>
          <Text my="space.2xs">
            <FormattedMessage intlKey="feature.authn.signIn.description" />
          </Text>
          <Text
            px="space.m"
            py="space.3xs"
            fontSize="size.subheading.2"
            fontWeight="weight.m"
            lineHeight="line.height.subheading.2"
            bg="background.primary"
            borderRadius="32px"
          >
            {name}
          </Text>
        </Flex>

        <Box>
          <InputGroup mb={hasError ? "space.xs" : "space.m"} height="54px">
            <Input
              value={input}
              onChange={handleChange}
              onKeyUp={handleKeyUp}
              placeholder="Email"
              type="email"
              autoFocus
              height="auto"
              px="space.l"
              py="space.m"
              fontSize="size.body.2"
              borderWidth="width.l"
              borderColor={hasError ? "border.alert" : "border.tertiary"}
              borderRadius="12px"
              bg="background.primary"
              _focusVisible={{
                borderColor: hasError ? "border.alert" : "border.highlight",
                borderWidth: "width.l",
              }}
              _hover={{
                borderColor: hasError ? "border.alert" : undefined,
              }}
            />
            <InputRightElement width="auto" height="100%" px="space.l">
              {renderInputIcon()}
            </InputRightElement>
          </InputGroup>
          {hasError && (
            <Text fontSize="size.body.3" color="font.alert" mb="space.4xl">
              <FormattedMessage intlKey="feature.authn.input.invalidEmail" />
            </Text>
          )}

          <Button
            onClick={onConfirm}
            disabled={!input || hasError}
            isLoading={hasSubmitted}
          >
            {renderButtonText()}
          </Button>

          {isRegistering && (
            <Text
              fontSize="size.help.1"
              color="font.secondary"
              textAlign="center"
              mt="space.3xl"
              mb="space.4xs"
            >
              <FormattedMessage
                intlKey="feature.authn.register.termsOfUse"
                values={{
                  a: (chunks: ReactNode) => (
                    <Link
                      href="https://portto.com/terms/"
                      isExternal
                      rel="noopener noreferrer"
                    >
                      {chunks}
                    </Link>
                  ),
                }}
              />
            </Text>
          )}
        </Box>
      </Flex>
    </>
  );
};

export default InputEmail;
