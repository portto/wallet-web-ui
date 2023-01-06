import { Box, Flex, HStack, Spinner } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import { estimatePoint, getAuthorization, updateAuthorization } from "src/apis";
import { ReactComponent as CheckAlert } from "src/assets/images/icons/check-alert.svg";
import { ReactComponent as Check } from "src/assets/images/icons/check-blue.svg";
import { ReactComponent as Logo } from "src/assets/images/icons/logo.svg";
import Button from "src/components/Button";
import DappLogo from "src/components/DappLogo";
import Field, { FieldLine } from "src/components/Field";
import Header from "src/components/Header";
import { useTransactionMachine } from "src/machines/transaction";
import { logSendTx } from "src/services/Amplitude";
import messages from "./messages";
import TransactionContent from "./TransactionContent";
import TransactionInfo from "./TransactionInfo";

interface EvmTransaction {
  data: string;
}

const Main = () => {
  const { context, send } = useTransactionMachine();
  // TODO: add operation detection logic
  const [recognizedTx] = useState(false);
  // TODO: add operation verified logic
  const [verifiedTx] = useState(false);
  const { user, transaction, dapp } = context;
  const dappDomain = new URL(dapp.url || "").host;
  const { rawObject } = transaction;

  const transactionData = rawObject.transactions
    .filter(({ data }: EvmTransaction) => data)
    .map(({ data }: EvmTransaction) => data)
    .join("\n\n");

  const hasDiscount = (transaction.discount || 0) > 0;
  const realTransactionFee =
    (transaction.fee || 0) - (transaction.discount || 0);

  useEffect(() => {
    const { sessionId = "" } = user;
    const { rawObject } = transaction;
    const { blockchain } = dapp;

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
  }, [user.sessionId, transaction.rawObject, dapp.blockchain]);

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
  }, [user, dapp, transaction]);

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
  }, [transaction.fee, realTransactionFee]);

  return (
    <Box>
      <Header
        onClose={() => send({ type: "close" })}
        blockchain={dapp?.blockchain}
      />
      <TransactionInfo host={dappDomain}>
        <DappLogo url={dapp.logo || ""} mb="space.s" />
      </TransactionInfo>
      <Box px="space.l">
        {recognizedTx ? (
          <>
            <Field
              title={<FormattedMessage {...messages.operation} />}
              hidableInfo={
                <TransactionContent verified={verifiedTx}>
                  {transactionData}
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
              hidableInfo={
                <TransactionContent>{transactionData}</TransactionContent>
              }
              icon={<CheckAlert width="16px" height="16px" />}
            >
              <FormattedMessage {...messages.transactionContainsScript} />
            </Field>
            <FieldLine />
          </>
        )}
      </Box>
      {/* // TODO: remove testing data. */}
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
          <FormattedMessage {...messages.approve} />
        </Button>
      </Flex>
    </Box>
  );
};

export default Main;
