import { Box, Flex, HStack, Text } from "@chakra-ui/react";
import { useCallback, useState } from "react";
import { FormattedMessage } from "react-intl";
import { getAuthorization, updateAuthorization } from "src/apis";
import { ReactComponent as CheckAlert } from "src/assets/images/icons/check-alert.svg";
import { ReactComponent as Check } from "src/assets/images/icons/check-blue.svg";
import { ReactComponent as Logo } from "src/assets/images/icons/logo.svg";
import Button from "src/components/Button";
import DappLogo from "src/components/DappLogo";
import Field, { FieldLine } from "src/components/Field";
import Header from "src/components/Header";
import TransactionContent from "src/components/TransactionContent";
import TransactionInfo from "src/components/TransactionInfo";
import { useTransactionMachine } from "src/machines/transaction";
import { logSendTx } from "src/services/Amplitude";
import { getFlowScriptWithTemplate } from "src/services/Flow";
import { getTransactionLocale } from "src/utils/locales";
import useTransactionDetail from "../hooks/useTransactionDetail";

const messages = {
  operation: {
    id: "app.authz.operation",
    defaultMessage: "Operation",
  },
  confirmTransactionFrom: {
    id: "app.authz.confirmTransactionFrom",
    defaultMessage: "Confirm transaction from",
  },
  transactionFee: {
    id: "app.authz.transactionFee",
    defaultMessage: "Transaction Fee",
  },
  approve: {
    id: "app.authz.approve",
    defaultMessage: "Approve",
  },
  script: {
    id: "app.authz.script",
    defaultMessage: "Script",
  },
  transactionContainsScript: {
    id: "app.authz.transactionContainsScript",
    defaultMessage: "This transaction contains script",
  },
  transactionFeePoints: {
    id: "app.authz.transactionFeePoints",
    defaultMessage: "{points} Points",
  },
  free: {
    id: "app.authz.free",
    defaultMessage: "Free (subsidized by Blocto)",
  },
};

const Main = () => {
  const { context, send } = useTransactionMachine();
  // TODO: add operation verified logic
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
    } else send({ type: "reject", data: { failReason: reason } });
  }, [user, dapp, transaction, dappDomain, send]);

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
        <FormattedMessage {...messages.free} />
      </Box>
    </HStack>
  );

  return (
    <Box>
      <Header
        bg="background.secondary"
        onClose={() => send({ type: "close" })}
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
              title={<FormattedMessage {...messages.operation} />}
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
            <Field title={<FormattedMessage {...messages.transactionFee} />}>
              {getTransactionFeeField()}
            </Field>
            <FieldLine />
          </>
        ) : (
          <>
            <Field title={<FormattedMessage {...messages.transactionFee} />}>
              {getTransactionFeeField()}
            </Field>
            <Box height="10px" bg="background.tertiary" mx="-20px" />
            <Field
              title={<FormattedMessage {...messages.script} />}
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
              <FormattedMessage {...messages.transactionContainsScript} />
            </Field>
            <FieldLine />
          </>
        )}
      </Box>
      <Flex justify="center" p="space.l" pos="absolute" bottom="0" width="100%">
        <Button onClick={approve}>
          <FormattedMessage {...messages.approve} />
        </Button>
      </Flex>
    </Box>
  );
};

export default Main;
