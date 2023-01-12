import { defineMessages } from "react-intl";

export default defineMessages({
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
  operationVerified: {
    id: "app.authz.operationVerified",
    defaultMessage: "This transaction is verified.",
  },
  operationNotVerified: {
    id: "app.authz.operationNotVerified",
    defaultMessage: "This transaction is not verified.",
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
  // original
  // TODO: remove unused string.
  confirmTransaction: {
    id: "app.authz.confirmTransaction",
    defaultMessage: "Confirm transaction",
  },

  decline: {
    id: "app.authz.decline",
    defaultMessage: "Decline",
  },

  data: {
    id: "app.authz.data",
    defaultMessage: "Data",
  },

  free: {
    id: "app.authz.free",
    defaultMessage: "Free",
  },

  transactionFeePoints: {
    id: "app.authz.transactionFeePoints",
    defaultMessage: "{points} Points",
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
