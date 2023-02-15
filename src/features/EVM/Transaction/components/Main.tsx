import { Box, Flex, HStack, Spinner } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { estimatePoint, getAuthorization, updateAuthorization } from "src/apis";
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
import { EvmTransaction } from "src/types";
import { ERROR_MESSAGES } from "src/utils/constants";
import useTransactionDetail from "../hooks/useTransactionDetail";

const Main = () => {
  const { context, send } = useTransactionMachine();
  // @todo: add operation detection logic
  const [recognizedTx] = useState(false);
  // @todo: add operation verified logic
  const [verifiedTx] = useState(false);

  const { user, transaction, dapp } = context;
  const dappDomain = (dapp.url ? new URL(dapp.url) : {}).host || "";
  const { rawObject } = transaction;

  const transactionData = rawObject.transactions
    .filter(({ data }: EvmTransaction) => data)
    .map(({ data }: EvmTransaction) => data)
    .join("\n\n");

  const hasDiscount = (transaction.discount || 0) > 0;
  const realTransactionFee =
    (transaction.fee || 0) - (transaction.discount || 0);

  const txDetailData = useTransactionDetail(transaction, user.balance);
  const {
    isNativeTransferring,
    usdValue = "0",
    tokenName,
    tokenAmount,
  } = txDetailData || {};

  const { sessionId = "" } = user;
  const { blockchain } = dapp;

  useEffect(() => {
    estimatePoint({ rawObject, sessionId, blockchain }).then(
      ({ cost, discount, error_code, chain_error_msg }) =>
        send({
          type: "updateTransaction",
          data: {
            fee: cost,
            discount,
            mayFail: error_code === "tx_may_fail",
            error: chain_error_msg,
          },
        })
    );
  }, [sessionId, rawObject, blockchain, send]);

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
    send({
      type: "reject",
      data: { error: ERROR_MESSAGES.AUTHZ_DECLINE_ERROR },
    });
  }, [send]);

  const getTransactionFeeField = useCallback(() => {
    return (
      <HStack>
        {transaction.fee ? (
          <>
            <Flex
              bg="background.secondary"
              borderRadius="50%"
              width="20px"
              height="20px"
              justifyContent="center"
              alignItems="center"
              mr="space.3xs"
              p="space.4xs"
            >
              <Logo />
            </Flex>
            <Box>
              <FormattedMessage
                intlKey="app.authz.transactionFeePoints"
                values={{ points: realTransactionFee }}
              />
              {hasDiscount && (
                <Box as="span" pl="space.3xs">
                  (
                  <Box as="del">
                    <FormattedMessage
                      intlKey="app.authz.transactionFeePoints"
                      values={{ points: transaction.fee }}
                    />
                  </Box>
                  )
                </Box>
              )}
            </Box>
          </>
        ) : (
          <Spinner width="15px" height="15px" color="icon.tertiary" />
        )}
      </HStack>
    );
  }, [transaction.fee, realTransactionFee, hasDiscount]);

  return (
    <Box>
      <Header
        bg="background.secondary"
        onClose={handleClose}
        blockchain={dapp?.blockchain}
      />
      <TransactionInfo
        host={dappDomain}
        transactionDetail={{
          usdValue,
          tokenAmount:
            tokenAmount && tokenName && `${tokenAmount} ${tokenName}`,
        }}
      >
        <DappLogo url={dapp.logo || ""} mb="space.s" />
      </TransactionInfo>
      <Box px="space.l">
        {recognizedTx ? (
          <>
            <Field
              title={<FormattedMessage intlKey="app.authz.operation" />}
              hidableInfo={
                !isNativeTransferring && (
                  <TransactionContent verified={verifiedTx}>
                    {transactionData}
                  </TransactionContent>
                )
              }
              icon={
                verifiedTx ? (
                  <Check width="16px" height="16px" />
                ) : (
                  <CheckAlert width="16px" height="16px" />
                )
              }
            >
              {/* // @todo: add operation detection logic. */}
              Operation Name
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
                !isNativeTransferring && (
                  <TransactionContent>{transactionData}</TransactionContent>
                )
              }
              icon={<CheckAlert width="16px" height="16px" />}
            >
              <FormattedMessage intlKey="app.authz.transactionContainsScript" />
            </Field>
            <FieldLine />
          </>
        )}
      </Box>
      {/* // @todo: remove testing data. */}
      {/* <Box>Dapp</Box>
      <Box px={4}>
        <Box>Dapp name: {dapp.name}</Box>
      </Box> */}
      {/* <Box>User</Box>
      <Box px={4}>
        <Box>Points: {user.points}</Box>
        <Box>
          Assets:{" "}
          {user.assets?.map((asset) => (
            <Box px={4} key={asset.name}>
              {asset.name} {asset.value} {asset.usd_price}
            </Box>
          ))}
        </Box>
      </Box>
      <Box>Transaction</Box>
      <Box px={4}>
        <Box>May Fail?: {transaction.mayFail ? "true" : "false"}</Box>
        <Box>Error: {transaction.error}</Box>
      </Box> */}
      <Flex justify="center" p="space.l" pos="absolute" bottom="0" width="100%">
        <Button onClick={approve}>
          <FormattedMessage intlKey="app.authz.approve" />
        </Button>
      </Flex>
    </Box>
  );
};

export default Main;
