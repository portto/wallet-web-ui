import { Box, Button, Input, InputGroup } from "@chakra-ui/react";
import { checkEmailExist, requestEmailAuth } from "apis";
import { useCallback, useEffect, useState } from "react";
import { useAuthenticateMachine } from "machines/authenticate";

const InputEmail = () => {
  const { send, context } = useAuthenticateMachine();
  const [input, setInput] = useState("");
  const { action } = context.user;

  // check email validity and existence when input changed
  useEffect(() => {
    // debounce with timeout
    const timeout = setTimeout(() => {
      // @todo: regex check email validity before send request
      checkEmailExist(input).then((exist: boolean) =>
        send({
          type: "updateUser",
          data: { action: exist ? "login" : "register" },
        })
      );
    }, 500);
    return () => clearTimeout(timeout);
  }, [send, input]);

  const onConfirm = useCallback(async () => {
    const email = input;
    // get auth code id
    const { id } = await requestEmailAuth({ action, email });
    if (id) {
      send({ type: "confirm", data: { email, authCodeId: id } });
    }
  }, [send, input, action]);

  return (
    <Box>
      <InputGroup>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Input Email"
        />
        <Button onClick={onConfirm}>submit</Button>
      </InputGroup>
    </Box>
  );
};

export default InputEmail;
