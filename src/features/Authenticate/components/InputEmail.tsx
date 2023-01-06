import {
  Box,
  Flex,
  Image,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  keyframes,
} from "@chakra-ui/react";
import debounce from "lodash/debounce";
import { useCallback, useState } from "react";
import { FormattedMessage } from "react-intl";
import check from "src/images/icons/check.svg";
import error from "src/images/icons/error.svg";
import inputLoading from "src/images/icons/input-loading.svg";
import { checkEmailExist, requestEmailAuth } from "src/apis";
import Button from "src/components/Button";
import Header from "src/components/Header";
import { useAuthenticateMachine } from "src/machines/authenticate";
import { checkEmailCap, checkEmailFormat } from "src/utils/checkEmailFormat";

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
  const [hasWarning, setHasWarning] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const {
    user: { action },
    dapp: { name, blockchain },
  } = context;

  const checkEmail = useCallback(
    debounce((email) => {
      if (!checkEmailFormat(email)) {
        setIsChecking(false);
        setHasError(true);
        return;
      }
      setHasError(false);
      setHasWarning(!checkEmailCap(email));
      // @todo: regex check email validity before send request
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
    if (!event.target.value) {
      setHasError(false);
      setHasWarning(false);
      return;
    }
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

  const handleClose = () => send("close");

  const renderButtonText = () => {
    if (isChecking || !input) {
      return <FormattedMessage id="feature.authn.signInOrRegister" />;
    }
    if (isEmailExistent) {
      return <FormattedMessage id="feature.authn.signIn.submit" />;
    }
    return <FormattedMessage id="feature.authn.register.submit" />;
  };

  return (
    <>
      <Header
        bg="background.secondary"
        blockchain={blockchain}
        onClose={handleClose}
      />
      <Box height="100%" px="space.l" pb="space.m" bg="background.secondary">
        <Flex
          flexDirection="column"
          alignItems="center"
          mt="space.s"
          mb="space.xl"
        >
          <Text fontSize="size.heading.4" fontWeight="weight.l">
            <FormattedMessage id="feature.authn.signIn.title" />
          </Text>
          <Text my="space.2xs">
            <FormattedMessage id="feature.authn.signIn.description" />
          </Text>
          <Text
            px="space.m"
            py="space.3xs"
            fontSize="size.subheading.2"
            fontWeight="weight.m"
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
              placeholder="Email"
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
              {/* eslint-disable-next-line no-nested-ternary */}
              {isChecking ? (
                <Image src={inputLoading} animation={rotateAnimation} />
              ) : hasError ? (
                <Image src={error} />
              ) : (
                input && <Image src={check} />
              )}
            </InputRightElement>
          </InputGroup>
          {(hasError || hasWarning) && (
            <Text fontSize="size.body.3" color="font.alert" mb="space.xs">
              <FormattedMessage
                id={
                  hasError
                    ? "feature.authn.input.invalidEmail"
                    : "feature.authn.input.checkCasing"
                }
              />
            </Text>
          )}

          <Button
            onClick={onConfirm}
            disabled={!input || hasError}
            isLoading={hasSubmitted}
          >
            {renderButtonText()}
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default InputEmail;
