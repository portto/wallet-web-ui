import { Box, Flex, HStack, Text } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { getAuthorization, updateAuthorization } from "src/apis";
import { ReactComponent as CheckAlert } from "src/assets/images/icons/check-alert.svg";
import { ReactComponent as Check } from "src/assets/images/icons/check-blue.svg";
import { ReactComponent as Logo } from "src/assets/images/icons/logo.svg";
import Button from "src/components/Button";
import DappLogo from "src/components/DappLogo";
import Field, { FieldLine } from "src/components/Field";
import FormattedMessage from "src/components/FormattedMessage";
import Header from "src/components/Header";
import TransactionContent from "src/components/TransactionContent";
import TransactionInfo from "src/components/TransactionInfo";
import { useTransactionMachine } from "src/machines/transaction";
import { logSendTx } from "src/services/Amplitude";
import { getFlowScriptWithTemplate } from "src/services/Flow";
import { ERROR_MESSAGES } from "src/utils/constants";
import isMaliciousTx from "src/utils/isMaliciousTx";
import { getTransactionLocale } from "src/utils/locales";
import useTransactionDetail from "../hooks/useTransactionDetail";

const Main = () => {
  const { context, send } = useTransactionMachine();
  const [isDangerousTx, setIsDangerousTx] = useState(false);
  // @todo: add operation verified logic
  const [verifiedTx] = useState(true);

  const {
    user,
    transaction: { rawObject },
    dapp,
  } = context;
  const { transaction } = rawObject;
  const dappDomain = (dapp.url ? new URL(dapp.url) : {}).host || "";
  const scriptInfo = getFlowScriptWithTemplate(transaction);

  const { usdValue, tokenAmount, recognizedTx } =
    useTransactionDetail(transaction);

  useEffect(() => {
    if (isMaliciousTx(transaction, dappDomain)) {
      setIsDangerousTx(true);
    }
  }, [dappDomain, transaction]);

  const approve = useCallback(async () => {
    const { sessionId, authorizationId = "" } = user;
    const { fee, discount } = transaction;
    const { id = "", blockchain, url = "", name = "" } = dapp;

    await updateAuthorization({
      authorizationId,
      action: "approve",
      sessionId,
      blockchain,
      cost: fee,
      discount,
    });
    const { status, transactionHash, reason } = await getAuthorization({
      blockchain,
      authorizationId,
    });
    if (status === "APPROVED") {
      send({ type: "approve", data: { txHash: transactionHash } });
      logSendTx({
        domain: dappDomain,
        url,
        chain: blockchain,
        type: "authz",
        dAppName: name,
        dAppId: id,
      });
    } else send({ type: "reject", data: { error: reason } });
  }, [user, dapp, transaction, dappDomain, send]);

  const handleClose = useCallback(async () => {
    const { sessionId, authorizationId = "" } = context.user;
    const { blockchain } = context.dapp;
    if (authorizationId) {
      await updateAuthorization({
        authorizationId,
        action: "decline",
        sessionId,
        blockchain,
      });
    }
    send({
      type: "reject",
      data: { error: ERROR_MESSAGES.AUTHZ_DECLINE_ERROR },
    });
  }, [context, send]);

  const getTransactionFeeField = () => (
    <HStack>
      <Flex
        bg="background.secondary"
        borderRadius="50%"
        width="20px"
        height="20px"
        justifyContent="center"
        alignItems="center"
        p="space.4xs"
      >
        <Logo />
      </Flex>
      <Box>
        <FormattedMessage intlKey="app.authz.free" />
      </Box>
    </HStack>
  );

  if (isDangerousTx) {
    send({ type: "dangerousTx" });
  }

  return (
    <Box>
      <Header
        bg="background.secondary"
        onClose={handleClose}
        blockchain={dapp?.blockchain}
      />
      <TransactionInfo
        host={dappDomain}
        transactionDetail={{ usdValue, tokenAmount }}
      >
        <DappLogo url={dapp.logo || ""} mb="space.s" />
      </TransactionInfo>
      <Box px="space.l">
        {recognizedTx ? (
          <>
            <Field
              title={<FormattedMessage intlKey="app.authz.operation" />}
              hidableInfo={
                <TransactionContent verified={verifiedTx}>
                  <Text
                    whiteSpace="pre"
                    wordBreak="break-word"
                    overflowX="auto"
                  >
                    {scriptInfo.arguments}
                    {/* temporarily remove params field, as it's deprecated on flow end */}
                    {/* but some dapps are still using them so leave it here until we can safely remove 'em */}
                    {/* scriptInfo.params */}
                    {scriptInfo.script}
                  </Text>
                </TransactionContent>
              }
              icon={
                verifiedTx ? (
                  <Check width="16px" height="16px" />
                ) : (
                  <CheckAlert width="16px" height="16px" />
                )
              }
            >
              <FormattedMessage
                id={`transaction-${recognizedTx.hash}`}
                defaultMessage={
                  recognizedTx.messages[getTransactionLocale()] ||
                  recognizedTx.messages.en
                }
                values={recognizedTx.args}
              />
            </Field>
            <FieldLine />
            <Field
              title={<FormattedMessage intlKey="app.authz.transactionFee" />}
            >
              {getTransactionFeeField()}
            </Field>
            <FieldLine />
          </>
        ) : (
          <>
            <Field
              title={<FormattedMessage intlKey="app.authz.transactionFee" />}
            >
              {getTransactionFeeField()}
            </Field>
            <Box height="10px" bg="background.tertiary" mx="-20px" />
            <Field
              title={<FormattedMessage intlKey="app.authz.script" />}
              hidableInfo={
                <TransactionContent>
                  <Text
                    whiteSpace="pre"
                    wordBreak="break-word"
                    overflowX="auto"
                  >
                    {scriptInfo.arguments}
                    {/* temporarily remove params field, as it's deprecated on flow end */}
                    {/* but some dapps are still using them so leave it here until we can safely remove 'em */}
                    {/* scriptInfo.params */}
                    {scriptInfo.script}
                  </Text>
                </TransactionContent>
              }
              icon={<CheckAlert width="16px" height="16px" />}
            >
              <FormattedMessage intlKey="app.authz.transactionContainsScript" />
            </Field>
            <FieldLine />
          </>
        )}
      </Box>
      <Flex justify="center" p="space.l" pos="absolute" bottom="0" width="100%">
        <Button onClick={approve}>
          <FormattedMessage intlKey="app.authz.approve" />
        </Button>
      </Flex>
    </Box>
  );
};

export default Main;
