import { Box, Flex, HStack } from "@chakra-ui/react";
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
// import TransactionContent from "src/components/TransactionContent";
import TransactionInfo from "src/components/TransactionInfo";
import { useTransactionMachine } from "src/machines/transaction";
import { logSendTx } from "src/services/Amplitude";
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

// const FLOW_MAX_DIGITS = 100000000;
// const CHAIN_FLOW = "flow";

const Main = () => {
  const { context, send } = useTransactionMachine();
  // TODO: add operation verified logic
  const [verifiedTx] = useState(false);

  const {
    user,
    transaction: { rawObject },
    dapp,
  } = context;
  const { transaction } = rawObject;
  const dappDomain = new URL(dapp.url || "").host;

  // TODO: add tx detail related logic
  // const isNativeTransferring = false;
  const { usdValue, tokenAmount, isRecognizedTx } = useTransactionDetail(
    transaction
    // user.balance
  );

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
        {isRecognizedTx ? (
          <>
            <Field
              title={<FormattedMessage {...messages.operation} />}
              // hidableInfo={
              //   !isNativeTransferring && (
              //     <TransactionContent verified={verifiedTx}>
              //       {transactionData}
              //     </TransactionContent>
              //   )
              // }
              icon={
                verifiedTx ? (
                  <Check width="16px" height="16px" />
                ) : (
                  <CheckAlert width="16px" height="16px" />
                )
              }
            >
              {/* //TODO: add operation detection logic. */}
              Operation Name
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
              // hidableInfo={
              //   !isNativeTransferring && (
              //     <TransactionContent>{transactionData}</TransactionContent>
              //   )
              // }
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
