import { Box, Flex } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { estimatePoint, getAuthorization, updateAuthorization } from "src/apis";
import { ReactComponent as CheckAlert } from "src/assets/images/icons/check-alert.svg";
import { ReactComponent as Check } from "src/assets/images/icons/check-blue.svg";
import Button from "src/components/Button";
import DappLogo from "src/components/DappLogo";
import Field, { FieldLine } from "src/components/Field";
import FieldDetail, { BadgeType } from "src/components/FieldDetail";
import FormattedMessage from "src/components/FormattedMessage";
import Header from "src/components/Header";
import EstimatePointErrorField from "src/components/transaction/EstimatePointErrorField";
import TransactionInfo from "src/components/transaction/TransactionInfo";
import TransactionFeeField from "src/components/TransactionFeeField";
import { useTransactionMachine } from "src/machines/transaction";
import { logSendTx } from "src/services/Amplitude";
import { EvmTransaction } from "src/types";
import { ERROR_MESSAGES } from "src/utils/constants";
import openMoonPayPage from "src/utils/openMoonPayPage";
import { ChainCoinSymbols } from "../constants";
import useTransactionDetail from "../hooks/useTransactionDetail";

const Main = () => {
  const { context, send } = useTransactionMachine();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isReady, setIsReady] = useState(false);
  // @todo: add operation detection logic
  const [recognizedTx, setIsRecognizedTx] = useState(false);
  // @todo: add operation verified logic
  const [verifiedTx, setVerifiedTx] = useState(false);

  const { user, transaction, dapp } = context;
  const dappDomain = (dapp.url ? new URL(dapp.url) : {}).host || "";
  const { rawObject, failReason, mayFail } = transaction;

  const transactionData = rawObject.transactions
    .filter(({ data }: EvmTransaction) => data)
    .map(({ data }: EvmTransaction) => data)
    .join("\n\n");

  const txDetailData = useTransactionDetail(transaction);
  const {
    isNativeTransferring,
    isSupportedTokenTransferring,
    usdValue = "0",
    tokenName,
    tokenAmount,
    hasEnoughBalance,
    tokenBalance,
  } = txDetailData || {};

  useEffect(() => {
    // For now we only set native transferring as recognized tx
    if (isNativeTransferring) {
      setIsRecognizedTx(true);
      setVerifiedTx(true);
    }
  }, [isNativeTransferring]);

  const { sessionId = "" } = user;
  const { blockchain } = dapp;
  const showInsufficientAmountHint =
    !hasEnoughBalance && isSupportedTokenTransferring;

  useEffect(() => {
    estimatePoint({ rawObject, sessionId, blockchain }).then(
      ({ cost, discount, error_code, chain_error_msg }) => {
        setIsReady(true);
        send({
          type: "updateTransaction",
          data: {
            fee: cost,
            discount,
            mayFail: !!error_code,
            failReason: chain_error_msg || error_code,
          },
        });
      }
    );
  }, [sessionId, rawObject, blockchain, send]);

  const handlePurchase = useCallback(() => {
    const { address = "", email = "", id = "" } = context.user;
    if (!email || !id || !address) return;

    const getMoonpayCoinSymbol = () =>
      (ChainCoinSymbols[blockchain] && ChainCoinSymbols[blockchain].moonpay) ||
      "eth";
    openMoonPayPage({
      currency: getMoonpayCoinSymbol(),
      address: address.toLowerCase(),
      email,
      userId: id,
    });
  }, [blockchain, context.user]);

  const approve = useCallback(async () => {
    const { sessionId = "", authorizationId = "" } = user;
    const { fee = 0, discount = 0 } = transaction;
    const { id = "", blockchain, name = "" } = dapp;

    setIsProcessing(true);
    await updateAuthorization({
      authorizationId,
      action: "approve",
      sessionId,
      blockchain,
      cost: fee,
      discount,
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
      {transactionData}
    </FieldDetail>
  );

  // const TransactionFeeField = () => (
  //   <Field title={<FormattedMessage intlKey="app.authz.transactionFee" />}>
  //     <HStack>
  //       {transaction.fee ? (
  //         <>
  //           <Flex
  //             bg="background.secondary"
  //             borderRadius="50%"
  //             width="20px"
  //             height="20px"
  //             justifyContent="center"
  //             alignItems="center"
  //             mr="space.3xs"
  //             p="space.4xs"
  //           >
  //             <Logo />
  //           </Flex>
  //           <Box>
  //             <FormattedMessage
  //               intlKey="app.authz.transactionFeePoints"
  //               values={{ points: realTransactionFee }}
  //             />
  //             {hasDiscount && (
  //               <Box as="span" pl="space.3xs">
  //                 (
  //                 <Box as="del">
  //                   <FormattedMessage
  //                     intlKey="app.authz.transactionFeePoints"
  //                     values={{ points: transaction.fee }}
  //                   />
  //                 </Box>
  //                 )
  //               </Box>
  //             )}
  //           </Box>
  //         </>
  //       ) : (
  //         <Spinner width="15px" height="15px" color="icon.tertiary" />
  //       )}
  //     </HStack>
  //   </Field>
  // );

  const InsufficientBalanceField = () => (
    <Field title={<FormattedMessage intlKey="app.authz.balance" />}>
      <Box color="font.alert">
        {`${tokenBalance} ${tokenName} `}
        (<FormattedMessage intlKey="app.authz.insufficientBalance" />)
      </Box>
    </Field>
  );

  const getTransactionFeeField = () => {
    if (showInsufficientAmountHint) {
      return <InsufficientBalanceField />;
    }
    return mayFail ? (
      <EstimatePointErrorField content={failReason} />
    ) : (
      <TransactionFeeField
        originalTransactionFee={transaction.fee}
        discount={transaction.discount}
      />
    );
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
        transactionDetail={{
          usdValue,
          tokenAmount:
            tokenAmount && tokenName ? `${tokenAmount} ${tokenName}` : "",
        }}
      >
        <DappLogo url={dapp.logo || ""} mb="space.s" />
      </TransactionInfo>
      <Box px="space.l">
        {recognizedTx ? (
          <>
            <>
              <Field
                title={<FormattedMessage intlKey="app.authz.operation" />}
                hidableInfo={transactionData && <TransactionContent />}
                icon={
                  verifiedTx ? (
                    <Check width="16px" height="16px" />
                  ) : (
                    <CheckAlert width="16px" height="16px" />
                  )
                }
              >
                {/* // @todo: add operation detection logic. */}
                <FormattedMessage
                  intlKey="app.authz.transferNativeToken"
                  values={{
                    amount: tokenAmount,
                    token: tokenName,
                  }}
                />
              </Field>
              <FieldLine />
            </>
            {getTransactionFeeField()}
            <FieldLine />
          </>
        ) : (
          <>
            {getTransactionFeeField()}
            {!isNativeTransferring && (
              <>
                <Box height="10px" bg="background.tertiary" mx="-20px" />
                <Field
                  title={<FormattedMessage intlKey="app.authz.script" />}
                  hidableInfo={<TransactionContent />}
                  icon={<CheckAlert width="16px" height="16px" />}
                >
                  <FormattedMessage intlKey="app.authz.transactionContainsScript" />
                </Field>
              </>
            )}
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
          <Button
            onClick={approve}
            disabled={mayFail || !isReady}
            isLoading={isProcessing}
          >
            <FormattedMessage intlKey="app.authz.approve" />
          </Button>
        )}
      </Flex>
    </Box>
  );
};

export default Main;
