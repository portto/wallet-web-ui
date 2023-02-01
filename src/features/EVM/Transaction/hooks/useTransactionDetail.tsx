import { useMemo } from "react";
import Web3 from "web3";
import { useTransactionMachine } from "src/machines/transaction";
import { Chains, EvmTransaction } from "src/types";

const { toBN, hexToNumberString, fromWei } = Web3.utils;

interface Transaction {
  rawObject?: {
    transactions: [EvmTransaction];
  };
  txHash?: string;
}

interface IChainCoinSymbols {
  [key: string]: {
    native: string;
    moonpay: string;
  };
}

const ChainCoinSymbols: IChainCoinSymbols = {
  ethereum: {
    native: "ETH",
    moonpay: "eth",
  },
  bsc: {
    native: "BNB",
    moonpay: "bnb_bsc",
  },
  polygon: {
    native: "MATIC",
    moonpay: "matic_polygon",
  },
  avalanche: {
    native: "AVAX",
    moonpay: "avax_cchain",
  },
};

const TRANSFER_FUNCTION_HASH = "0xa9059cbb";

const getNativeCoinSymbol = (blockchain: Partial<Chains>) => {
  return (
    (ChainCoinSymbols[blockchain] && ChainCoinSymbols[blockchain].native) ||
    "ETH"
  );
};

const isNativeBalanceEnough = (
  transactions: [EvmTransaction],
  userBalance: number
) => {
  if (!transactions.length) {
    return false;
  }

  if (
    transactions.every(
      ({ value }) => !value || hexToNumberString(value) === "0"
    )
  ) {
    return true;
  }

  const transactionValueBN = transactions
    .map(({ value }) => toBN(hexToNumberString(value || "0")))
    .reduce((acc, cur) => acc.add(cur), toBN(0));

  const userBalanceBN = toBN(userBalance);

  return userBalanceBN.gte(transactionValueBN);
};

export default function useTransactionDetail(
  transaction: Transaction,
  userBalance = 0
) {
  const { context } = useTransactionMachine();
  const { dapp } = context;
  const { assets = [] } = context.user;
  const ethAssets = Object.fromEntries(
    assets.map((asset) => [asset.symbol, asset])
  );

  const {
    rawObject: { transactions } = {
      transactions: [{ value: "", to: "", from: "", data: "" }],
    },
    txHash,
  } = transaction;
  const [{ value }] = transactions;

  const txContractAddress = transactions[0].to;
  const isNativeTransferring = !txHash && !!value;
  const isERC20Transferring =
    txHash && txHash.startsWith(TRANSFER_FUNCTION_HASH);
  const nativeTokenName = getNativeCoinSymbol(dapp.blockchain);

  return useMemo(() => {
    if (isNativeTransferring) {
      const nativeToken = ethAssets && ethAssets[nativeTokenName];
      const nativeTokenAmount = fromWei(
        transactions
          .map(({ value }) => toBN(hexToNumberString(value || "0")))
          .reduce((acc, cur) => acc.add(cur), toBN(0))
      );

      const nativeTokenValue = nativeToken ? nativeToken.usd_price : 0;

      return {
        isNativeTransferring,
        isSupportedTokenTransferring: !!nativeToken,
        tokenName: nativeTokenName,
        tokenAmount: nativeTokenAmount,
        usdValue: (
          parseFloat(nativeTokenAmount) * parseFloat(nativeTokenValue)
        ).toFixed(2),
        hasEnoughBalance: isNativeBalanceEnough(transactions, userBalance),
      };
    }

    if (!isERC20Transferring) return;

    const web3 = new Web3();
    const transferParams =
      txHash &&
      web3.eth.abi.decodeParameters(["address", "uint256"], txHash.slice(10));
    const tokenAmount = transferParams ? fromWei(transferParams[1]) : "0";

    const tokenName =
      ethAssets &&
      Object.keys(ethAssets).find(
        (key) => ethAssets[key].contract_address === txContractAddress
      );
    const tokenDetail = ethAssets && ethAssets[tokenName];

    const { usd_price: usdPrice, value: tokenBalance } = tokenDetail || {};

    return {
      isNativeTransferring,
      isSupportedTokenTransferring: !!tokenDetail && isERC20Transferring,
      tokenName,
      tokenAmount,
      usdValue: `${(parseFloat(usdPrice) * parseFloat(tokenAmount)).toFixed(
        2
      )}`,
      hasEnoughBalance: tokenBalance >= tokenAmount,
    };
  }, [
    ethAssets,
    isERC20Transferring,
    isNativeTransferring,
    transactions,
    txContractAddress,
    txHash,
    userBalance,
    nativeTokenName,
  ]);
}
