import Web3 from "web3";
import { useTransactionMachine } from "src/machines/transaction";
import { Chains } from "src/utils/constants";
import { EvmTransaction } from "../components/Main";

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
    .map(({ value }) => toBN(hexToNumberString(value)))
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
  const isNativeTransfering = !txHash && !!value;
  const isERC20Transfering =
    txHash && txHash.startsWith(TRANSFER_FUNCTION_HASH);
  const nativeTokenName = getNativeCoinSymbol(dapp.blockchain);

  if (isNativeTransfering) {
    const nativeToken = ethAssets && ethAssets[nativeTokenName];
    const nativeTokenAmount = fromWei(
      transactions
        .map(({ value }) => toBN(hexToNumberString(value)))
        .reduce((acc, cur) => acc.add(cur), toBN(0))
    );

    const nativeTokenValue = nativeToken ? nativeToken.usd_price : 0;

    return {
      isSupportedTokenTransfering: !!nativeToken,
      tokenName: nativeTokenName,
      tokenAmount: nativeTokenAmount,
      usdValue: (
        parseFloat(nativeTokenAmount) * parseFloat(nativeTokenValue)
      ).toFixed(2),
      hasEnoughBalance: isNativeBalanceEnough(transactions, userBalance),
    };
  }

  if (!isERC20Transfering) return null;

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
    isSupportedTokenTransfering: !!tokenDetail && isERC20Transfering,
    tokenName,
    tokenAmount,
    usdValue: (parseFloat(usdPrice) * parseFloat(tokenAmount)).toFixed(2),
    hasEnoughBalance: tokenBalance >= tokenAmount,
  };
}
