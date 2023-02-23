import { Box, Center, Flex, Text } from "@chakra-ui/react";
import { useCallback, useMemo } from "react";
import FormattedMessage from "src/components/FormattedMessage";
import Header from "src/components/Header";
import LoadingLogo from "src/components/LoadingLogo";
import useNonCustodialTransaction from "src/hooks/useNonCustodialTransaction";
import { useTransactionMachine } from "src/machines/transaction";

const NonCustodial = () => {
  const { context, send } = useTransactionMachine();
  const { blockchain, url = "", name = "", logo = "" } = context.dapp;
  const { transaction } = context;
  const { rawObject } = transaction;
  const {
    type: payload_type,
    arguments: args = [],
    function: functionName = "",
    type_arguments,
    code,
  } = rawObject.transaction;

  const payload = useMemo(
    () => ({
      title: name,
      image: logo,
      blockchain,
      url,
      type: "tx",
      txs: rawObject.transaction,
      payload_type,
      code,
      function: functionName,
      arguments: args,
      type_arguments,
    }),
    [
      args,
      payload_type,
      blockchain,
      code,
      functionName,
      logo,
      name,
      rawObject.transaction,
      type_arguments,
      url,
    ]
  );
  useNonCustodialTransaction(payload);

  const handleClose = useCallback(() => send("close"), [send]);

  return (
    <Box position="relative">
      <Header blockchain={context.dapp.blockchain} onClose={handleClose} />
      <Box position="absolute" top="0" left="0" width="100%" height="100%">
        <Center height="100%">
          <Flex flexDirection="column" alignItems="center">
            <LoadingLogo mb="space.s" />
            <Text
              fontSize="size.heading.4"
              fontWeight="weight.l"
              lineHeight="line.height.subheading.1"
              mb="space.2xs"
            >
              <FormattedMessage intlKey="feature.authz.nonCustodial.title" />
            </Text>
            <Text fontSize="size.body.3" textAlign="center">
              <FormattedMessage intlKey="feature.authz.nonCustodial.description" />
            </Text>
          </Flex>
        </Center>
      </Box>
    </Box>
  );
};

export default NonCustodial;
