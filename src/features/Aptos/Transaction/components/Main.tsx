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
import { ERROR_MESSAGES } from "src/utils/constants";
import useTransactionDetail from "../hooks/useTransactionDetail";

const Main = () => {
  const { context, send } = useTransactionMachine();
  const [recognizedTx, setRecognizedTx] = useState(false);
  const [verifiedTx, setVerifiedTx] = useState(false);

  const { user, transaction, dapp } = context;
  const dappDomain = (dapp.url ? new URL(dapp.url) : {}).host || "";
  const { rawObject } = transaction;
  const {
    type,
    arguments: args = [],
    function: functionName = "",
    type_arguments: typeArgs = [],
    code,
  } = rawObject.transaction;
  const [moduleAddress = "", moduleName, methodName] =
    functionName.split("::") || [];

  const hasDiscount = (transaction.discount || 0) > 0;
  const realTransactionFee =
    (transaction.fee || 0) - (transaction.discount || 0);

  const txDetailData = useTransactionDetail(rawObject.transaction);
  const { tokenAmount = "", usdValue = "" } = txDetailData || {};

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

    // Framework module address range: 0x1 - 0xa
    if (Number(moduleAddress) >= 1 && Number(moduleAddress) <= 10) {
      setRecognizedTx(true);
      setVerifiedTx(true);
    }
  }, [sessionId, rawObject, blockchain, send, moduleAddress]);

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

  const getTransactionData = () => {
    if (functionName) {
      return (
        <>
          {/* @todo: support other tx type */}
          Type: entry_function_payload
          <br />
          {!!typeArgs.length && (
            <>
              Type Arguments: [{typeArgs.join(", ")}]<br />
            </>
          )}
          {!!args.length && (
            <>
              Arguments: [{args.join(", ")}]<br />
            </>
          )}
          <br />
          {functionName}
        </>
      );
    }
    if (code) {
      /* @todo: support other tx type */
      return (
        <>
          Type: {type}
          <br />
          {!!typeArgs.length && (
            <>
              Type Arguments: [{typeArgs.join(", ")}]<br />
            </>
          )}
          {!!args.length && (
            <>
              Arguments: [{args.join(", ")}]<br />
            </>
          )}
          <br />
          {functionName || (code && code.bytecode)}
        </>
      );
    }
    return null;
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
        transactionDetail={{ tokenAmount, usdValue }}
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
                  {getTransactionData()}
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
              {`${moduleName}::${methodName}`}
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
                <TransactionContent>{getTransactionData()}</TransactionContent>
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
