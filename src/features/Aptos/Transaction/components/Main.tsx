import { Box, Flex } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { getAuthorization, updateAuthorization } from "src/apis";
import { ReactComponent as CheckAlert } from "src/assets/images/icons/check-alert.svg";
import { ReactComponent as Check } from "src/assets/images/icons/check-blue.svg";
import ActivityDetail from "src/components/ActivityDetail";
import Button from "src/components/Button";
import DappLogo from "src/components/DappLogo";
import Field, { FieldLine } from "src/components/Field";
import FieldDetail, { BadgeType } from "src/components/FieldDetail";
import FormattedMessage from "src/components/FormattedMessage";
import Header from "src/components/Header";
import ScrollableContainer from "src/components/ScrollableContainer";
import EstimatePointErrorField from "src/components/transaction/EstimatePointErrorField";
import TransactionFeeField from "src/components/transaction/TransactionFeeField";
import TransactionInfo from "src/components/transaction/TransactionInfo";
import useEstimatePoint from "src/hooks/useEstimatePoint";
import { useTransactionMachine } from "src/machines/transaction";
import { logSendTx } from "src/services/Amplitude";
import { ERROR_MESSAGES } from "src/utils/constants";
import useTransactionDetail from "../hooks/useTransactionDetail";

const Main = () => {
  const { context, send } = useTransactionMachine();
  const [recognizedTx, setRecognizedTx] = useState(false);
  const [verifiedTx, setVerifiedTx] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const { user, transaction, dapp } = context;
  const dappDomain = (dapp.url ? new URL(dapp.url) : {}).host || "";
  const { rawObject, mayFail, failReason } = transaction;
  const {
    type,
    arguments: args = [],
    function: functionName = "",
    type_arguments: typeArgs = [],
    code,
  } = rawObject.transaction;
  const [moduleAddress = "", moduleName, methodName] =
    functionName.split("::") || [];

  const txDetailData = useTransactionDetail(rawObject.transaction);
  const {
    tokenAmount = "",
    tokenBalance,
    tokenName,
    usdValue = "",
    hasEnoughBalance,
    hasValue,
  } = txDetailData || {};
  const showInsufficientBalance = hasValue && !hasEnoughBalance;
  const { blockchain, name } = dapp;

  const [isReady] = useEstimatePoint({ rawObject, blockchain });

  useEffect(() => {
    // Framework module address range: 0x1 - 0xa
    if (Number(moduleAddress) >= 1 && Number(moduleAddress) <= 10) {
      setRecognizedTx(true);
      setVerifiedTx(true);
    }

    if (type === "entry_function_payload") {
      setRecognizedTx(true);
    }
  }, [rawObject, blockchain, send, moduleAddress, type]);

  const approve = useCallback(async () => {
    const { authorizationId = "" } = user;
    const { fee = 0, discount = 0, feeType } = transaction;
    const { id = "", blockchain, name = "" } = dapp;

    setIsProcessing(true);
    await updateAuthorization({
      authorizationId,
      action: "approve",
      blockchain,
      cost: fee,
      discount,
      type: feeType,
    });
    setIsProcessing(false);

    const { status, transactionHash, reason } = await getAuthorization({
      blockchain,
      authorizationId,
    });
    if (status === "APPROVED") {
      send({ type: "approve", data: { txHash: transactionHash } });
      logSendTx({
        domain: dappDomain,
        chain: blockchain,
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

  const TransactionContent = () => (
    <FieldDetail
      title={<FormattedMessage intlKey="app.authz.operation" />}
      badgeText={
        <FormattedMessage
          intlKey={
            verifiedTx
              ? "app.authz.operationVerified"
              : "app.authz.operationNotVerified"
          }
        />
      }
      badgeType={verifiedTx ? BadgeType.Verified : BadgeType.Unverified}
    >
      {getTransactionData()}
    </FieldDetail>
  );

  const InsufficientBalanceField = () => (
    <Field title={<FormattedMessage intlKey="app.authz.balance" />}>
      <Box color="font.alert">
        {`${tokenBalance} ${tokenName} `}
        (<FormattedMessage intlKey="app.authz.insufficientAmount" />)
      </Box>
    </Field>
  );

  const getTransactionFeeField = () => {
    if (showInsufficientBalance) {
      return <InsufficientBalanceField />;
    }

    return mayFail ? (
      <EstimatePointErrorField content={failReason} />
    ) : (
      <TransactionFeeField />
    );
  };

  const targetAddress = hasValue && args[0];

  return (
    <>
      <Header
        bg="background.secondary"
        onClose={handleClose}
        blockchain={dapp?.blockchain}
      />
      <Flex flexDirection="column" overflow="hidden">
        <TransactionInfo
          host={dappDomain}
          transactionDetail={{ tokenAmount, usdValue }}
        >
          <DappLogo url={dapp.logo || ""} mb="space.s" />
        </TransactionInfo>

        <ScrollableContainer px="space.l">
          {recognizedTx ? (
            <>
              <Field
                title={<FormattedMessage intlKey="app.authz.operation" />}
                hidableInfo={<TransactionContent />}
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
              {getTransactionFeeField()}
              <FieldLine />
              <ActivityDetail
                blockchain={blockchain}
                dAppName={name}
                address={targetAddress}
              />
              <FieldLine />
            </>
          ) : (
            <>
              {getTransactionFeeField()}
              <Box height="10px" bg="background.tertiary" mx="-20px" />
              <Field
                title={<FormattedMessage intlKey="app.authz.script" />}
                hidableInfo={<TransactionContent />}
                icon={<CheckAlert width="16px" height="16px" />}
              >
                <FormattedMessage intlKey="app.authz.transactionContainsScript" />
              </Field>
              <FieldLine />
              <ActivityDetail
                blockchain={blockchain}
                dAppName={name}
                address={targetAddress}
              />
              <FieldLine />
            </>
          )}
        </ScrollableContainer>

        <Flex justify="center" p="space.l" width="100%">
          <Button
            onClick={approve}
            disabled={showInsufficientBalance || mayFail || !isReady}
            isLoading={isProcessing}
          >
            <FormattedMessage intlKey="app.authz.approve" />
          </Button>
        </Flex>
      </Flex>
    </>
  );
};

export default Main;
