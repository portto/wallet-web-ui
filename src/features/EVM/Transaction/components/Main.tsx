import { Box, Button, Flex, Img } from "@chakra-ui/react";
import { useCallback, useEffect } from "react";
import { estimatePoint, getAuthorization, updateAuthorization } from "src/apis";
import { ReactComponent as CheckAlert } from "src/assets/images/icons/check-alert.svg";
import { ReactComponent as Check } from "src/assets/images/icons/check-blue.svg";
import DappLogo from "src/components/DappLogo";
import Field, { FieldLine } from "src/components/Field";
import Header from "src/components/Header";
import { useTransactionMachine } from "src/machines/transaction";
import { logSendTx } from "src/services/Amplitude";
import TransactionContent from "./TransactionContent";
import TransactionInfo from "./TransactionInfo";

interface EvmTransaction {
  data: string;
}

const Main = () => {
  const { context, send } = useTransactionMachine();

  const { user, transaction, dapp } = context;
  const dappDomain = new URL(dapp.url || "").host;
  const { rawObject } = transaction;
  const transactionData = rawObject.transactions
    .filter(({ data }: EvmTransaction) => data)
    .map(({ data }: EvmTransaction) => data)
    .join("\n\n");

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

  return (
    <Box fontSize={10}>
      <Header
        onClose={() => send({ type: "close" })}
        blockchain={dapp?.blockchain}
      />
      <TransactionInfo host={dappDomain}>
        <DappLogo url={dapp.logo || ""} />
      </TransactionInfo>
      <Box px="20px">
        <Field
          title="Message"
          hidableInfo={
            <TransactionContent verified>{transactionData}</TransactionContent>
          }
          icon={<Check width="16px" height="16px" />}
        >
          Hello Blocto !
        </Field>
        <FieldLine />
        <Field
          title="Message"
          hidableInfo={
            <TransactionContent>{transactionData}</TransactionContent>
          }
          icon={<CheckAlert width="16px" height="16px" />}
        >
          Hello Blocto !
        </Field>
        <FieldLine />
      </Box>

      <Box>Dapp</Box>
      <Box px={4}>
        <Box>Dapp name: {dapp.name}</Box>
        <Flex align="center">
          Dapp Logo: <Img width={8} height={8} src={dapp.logo} />
        </Flex>
        <Box>Dapp URL: {dapp.url}</Box>
      </Box>
      <Box>User</Box>
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
        <Box>Fee: {transaction.fee}</Box>
        <Box>Discount: {transaction.discount}</Box>
        <Box>May Fail?: {transaction.mayFail ? "true" : "false"}</Box>
        <Box>Error: {transaction.error}</Box>
      </Box>
      <Flex justify="center">
        <Button onClick={approve}>Approve</Button>
      </Flex>
    </Box>
  );
};

export default Main;
