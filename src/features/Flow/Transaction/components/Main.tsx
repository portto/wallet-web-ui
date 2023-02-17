import { Box, Flex, HStack, Text } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { getAuthorization, updateAuthorization } from "src/apis";
import { ReactComponent as CheckAlert } from "src/assets/images/icons/check-alert.svg";
import { ReactComponent as Check } from "src/assets/images/icons/check-blue.svg";
import { ReactComponent as Logo } from "src/assets/images/icons/logo.svg";
import Button from "src/components/Button";
import DappLogo from "src/components/DappLogo";
import Field, { FieldLine } from "src/components/Field";
import FieldDetail, { BadgeType } from "src/components/FieldDetail";
import FormattedMessage from "src/components/FormattedMessage";
import Header from "src/components/Header";
import TransactionInfo from "src/components/TransactionInfo";
import { useTransactionMachine } from "src/machines/transaction";
import { logSendTx } from "src/services/Amplitude";
import { getFlowScriptWithTemplate } from "src/services/Flow";
import { ERROR_MESSAGES } from "src/utils/constants";
import isMaliciousTx from "src/utils/isMaliciousTx";
import { getTransactionLocale } from "src/utils/locales";
import openMoonPayPage from "src/utils/openMoonPayPage";
import { MoonpayCoinSymbols } from "../constants";
import useTransactionDetail from "../hooks/useTransactionDetail";

const TransactionFeeField = () => (
  <Field title={<FormattedMessage intlKey="app.authz.transactionFee" />}>
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
  </Field>
);

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

  const {
    usdValue,
    tokenAmount,
    recognizedTx,
    hasEnoughBalance,
    tokenBalances,
  } = useTransactionDetail(transaction);
  const showInsufficientAmountHint = !hasEnoughBalance && !!recognizedTx;

  useEffect(() => {
    if (isMaliciousTx(transaction, dappDomain)) {
      setIsDangerousTx(true);
    }
  }, [dappDomain, transaction]);

  const handlePurchase = useCallback(() => {
    const { address = "", email = "", id: userId = "" } = context.user;

    if (!recognizedTx || !recognizedTx.balances) {
      return;
    }

    const firstBalance = Object.keys(recognizedTx.balances)[0];
    const currency =
      recognizedTx.balances[firstBalance as keyof typeof recognizedTx.balances];

    openMoonPayPage({
      currency:
        MoonpayCoinSymbols[
          currency.toLowerCase() as keyof typeof MoonpayCoinSymbols
        ] || currency,
      address,
      email,
      userId,
    });
  }, [context.user, recognizedTx]);

  const approve = useCallback(async () => {
    const { sessionId = "", authorizationId = "" } = user;
    const { fee = 0, discount = 0 } = transaction;
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
    send({
      type: "reject",
      data: { error: ERROR_MESSAGES.AUTHZ_DECLINE_ERROR },
    });
  }, [send]);

  if (isDangerousTx) {
    send({ type: "dangerousTx" });
  }

  const InsufficientBalanceField = () => (
    <Field title={<FormattedMessage intlKey="app.authz.balance" />}>
      <Box color="font.alert">
        {`${tokenBalances} `}
        (<FormattedMessage intlKey="app.authz.insufficientBalance" />)
      </Box>
    </Field>
  );

  const getTransactionFeeField = () => {
    if (showInsufficientAmountHint) {
      return <InsufficientBalanceField />;
    }
    return <TransactionFeeField />;
  };
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
                <FieldDetail
                  title={<FormattedMessage intlKey="app.authz.operation" />}
                  badgeText={
                    <FormattedMessage intlKey="app.authz.operationVerified" />
                  }
                  badgeType={BadgeType.Verified}
                >
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
                </FieldDetail>
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
            {getTransactionFeeField()}
            <FieldLine />
          </>
        ) : (
          <>
            {getTransactionFeeField()}
            <Box height="10px" bg="background.tertiary" mx="-20px" />
            <Field
              title={<FormattedMessage intlKey="app.authz.script" />}
              hidableInfo={
                <FieldDetail
                  title={<FormattedMessage intlKey="app.authz.operation" />}
                  badgeText={
                    <FormattedMessage intlKey="app.authz.operationNotVerified" />
                  }
                  badgeType={BadgeType.Unverified}
                >
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
                </FieldDetail>
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
        {showInsufficientAmountHint ? (
          <Button onClick={handlePurchase}>
            <FormattedMessage intlKey="app.authz.purchaseonmoonpay" />
          </Button>
        ) : (
          <Button onClick={approve}>
            <FormattedMessage intlKey="app.authz.approve" />
          </Button>
        )}
      </Flex>
    </Box>
  );
};

export default Main;
