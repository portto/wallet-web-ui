import { Box, Flex, HStack, Spinner } from "@chakra-ui/react";
import { useCallback, useEffect } from "react";
import { FormattedMessage } from "react-intl";
import { estimatePoint, getAuthorization, updateAuthorization } from "src/apis";
import { ReactComponent as CheckAlert } from "src/assets/images/icons/check-alert.svg";
import { ReactComponent as Logo } from "src/assets/images/icons/logo.svg";
import Button from "src/components/Button";
import DappLogo from "src/components/DappLogo";
import Field, { FieldLine } from "src/components/Field";
import Header from "src/components/Header";
import TransactionContent from "src/components/TransactionContent";
import TransactionInfo from "src/components/TransactionInfo";
import { useTransactionMachine } from "src/machines/transaction";
import { logSendTx } from "src/services/Amplitude";

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

  const { user, transaction, dapp } = context;
  const dappDomain = new URL(dapp.url || "").host;
  const { rawObject } = transaction;

  const hasDiscount = (transaction.discount || 0) > 0;
  const realTransactionFee =
    (transaction.fee || 0) - (transaction.discount || 0);

  const { sessionId = "" } = user;

  const { blockchain } = dapp;

  useEffect(() => {
    const actualTx = rawObject.convertedTx || rawObject.transaction;
    estimatePoint({
      rawObject: { ...rawObject, message: actualTx },
      sessionId,
      blockchain,
    }).then(({ cost, discount, error_code, chain_error_msg }) =>
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
    } else send({ type: "reject", data: { failReason: reason } });
  }, [user, dapp, transaction, dappDomain, send]);

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
                {...messages.transactionFeePoints}
                values={{ points: realTransactionFee }}
              />
              {hasDiscount && (
                <Box as="span" pl="space.3xs">
                  (
                  <Box as="del">
                    <FormattedMessage
                      {...messages.transactionFeePoints}
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
        onClose={() => send({ type: "close" })}
        blockchain={dapp?.blockchain}
      />
      <TransactionInfo host={dappDomain}>
        <DappLogo url={dapp.logo || ""} mb="space.s" />
      </TransactionInfo>

      <Box px="space.l">
        <Field title={<FormattedMessage {...messages.transactionFee} />}>
          {getTransactionFeeField()}
        </Field>
        <Box height="10px" bg="background.tertiary" mx="-20px" />
        <Field
          title={<FormattedMessage {...messages.script} />}
          hidableInfo={
            !!rawObject.convertedTx && (
              <TransactionContent>{rawObject.convertedTx}</TransactionContent>
            )
          }
          icon={<CheckAlert width="16px" height="16px" />}
        >
          <FormattedMessage {...messages.transactionContainsScript} />
        </Field>
        <FieldLine />
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
