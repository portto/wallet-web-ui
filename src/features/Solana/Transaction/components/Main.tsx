import { Box, Flex } from "@chakra-ui/react";
import { useCallback, useState } from "react";
import { getAuthorization, updateAuthorization } from "src/apis";
import { ReactComponent as CheckAlert } from "src/assets/images/icons/check-alert.svg";
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

const Main = () => {
  const { context, send } = useTransactionMachine();
  const [isProcessing, setIsProcessing] = useState(false);
  const { user, transaction, dapp } = context;

  const dappDomain = (dapp.url ? new URL(dapp.url) : {}).host || "";
  const { rawObject, mayFail, failReason } = transaction;
  const { blockchain, name } = dapp;
  const actualTx = rawObject.convertedTx || rawObject.transaction;

  const [isReady] = useEstimatePoint({
    rawObject: { ...rawObject, message: actualTx },
    blockchain,
  });

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

  const getTransactionFeeField = () => {
    return mayFail ? (
      <EstimatePointErrorField content={failReason} />
    ) : (
      <TransactionFeeField />
    );
  };

  const handleClose = useCallback(async () => {
    send({
      type: "reject",
      data: { error: ERROR_MESSAGES.AUTHZ_DECLINE_ERROR },
    });
  }, [send]);

  return (
    <>
      <Header
        bg="background.secondary"
        onClose={handleClose}
        blockchain={dapp?.blockchain}
      />
      <Flex flexDirection="column" overflow="hidden">
        <TransactionInfo host={dappDomain}>
          <DappLogo url={dapp.logo || ""} mb="space.s" />
        </TransactionInfo>
        <ScrollableContainer attachShadow px="space.l">
          {getTransactionFeeField()}
          <Box height="10px" bg="background.tertiary" mx="-20px" />
          <Field
            title={<FormattedMessage intlKey="app.authz.script" />}
            hidableInfo={
              !!rawObject.convertedTx && (
                <FieldDetail
                  title={<FormattedMessage intlKey="app.authz.operation" />}
                  badgeText={
                    <FormattedMessage intlKey="app.authz.operationNotVerified" />
                  }
                  badgeType={BadgeType.Unverified}
                >
                  {rawObject.convertedTx}
                </FieldDetail>
              )
            }
            icon={<CheckAlert width="16px" height="16px" />}
          >
            <FormattedMessage intlKey="app.authz.transactionContainsScript" />
          </Field>
          <FieldLine />
          <ActivityDetail blockchain={blockchain} dAppName={name} />
          <FieldLine />
        </ScrollableContainer>
        <Flex justify="center" p="space.l" width="100%">
          <Button
            onClick={approve}
            disabled={mayFail || !isReady}
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
