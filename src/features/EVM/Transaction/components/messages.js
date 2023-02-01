import { defineMessages } from "react-intl";

export default defineMessages({
  // original
  // TODO: remove unused string.
  confirmTransaction: {
    id: "app.authz.confirmTransaction",
    defaultMessage: "Confirm transaction",
  },

  transactionMayFail: {
    id: "app.authz.transactionMayFail",
    defaultMessage: "Transaction may fail",
  },

  pointNotEnoughForTx: {
    id: "app.authz.pointNotEnoughForTx",
    defaultMessage:
      "Blocto points not enough, please go to the app to purchase and create a wallet.",
  },

  estimatingPoint: {
    id: "app.authz.estimatingPoint",
    defaultMessage: "Estimating...",
  },

  insufficientBalance: {
    id: "app.authz.insufficientBalance",
    defaultMessage: "Insufficient balance",
  },

  balance: {
    id: "app.authz.balance",
    defaultMessage: "Balance",
  },

  buyCrypto: {
    id: "app.authz.buyCrypto",
    defaultMessage: "Get {currency}",
  },

  transferAmount: {
    id: "app.authz.transferAmount",
    defaultMessage: "Transfer Amount",
  },

  transactionContainsData: {
    id: "app.authz.transactionContainsData",
    defaultMessage: "This transaction contains data",
  },

  processing: {
    id: "app.authz.processing",
    defaultMessage: "Processing",
  },

  dangerous: {
    id: "app.authz.dangerous",
    defaultMessage:
      "Detected malicious operation!<br />We will reject for you.",
  },

  purchaseInExchange: {
    id: "app.authz.purchaseInExchange",
    defaultMessage:
      "You can also buy {currency} from exchanges and send to your address.",
  },

  purchaseOnMoonpay: {
    id: "app.authz.purchaseOnMoonpay",
    defaultMessage: "Purchase on MoonPay",
  },
});
