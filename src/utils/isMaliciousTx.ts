import transactionsMainnet from "@blocto/flow-transactions/build/messages.mainnet.sha3.json";
import transactionsTestnet from "@blocto/flow-transactions/build/messages.testnet.sha3.json";
import { IS_MAINNET, IS_SANDBOXNET, IS_TESTNET } from "src/services/Env";
import { FlowTransaction } from "src/types";
import hashMsg from "src/utils/hashMsg";

const BLOCTO_ADDRESS = process.env.REACT_APP_BLOCTO_ADDRESS || "";
// TODO: Get recognized transactions from @blocto/flow-transactions for sandboxnet

type RecognizedTransactions = {
  [key: string]: object;
};
const getTransactions = (): RecognizedTransactions | undefined => {
  if (IS_TESTNET) return transactionsTestnet;
  if (IS_MAINNET) return transactionsMainnet;
};

const WHITELIST_ADDRS = [
  "937cbdee135c656c",
  "7f560d7e3ff04a31",
  "a5549d51fe9a0dac",
  "d542df6ee4a82dce",
  "d5f1a3954f06b231",
  "ac032742cfbc83b7",
  "6b23b5b157fd8701",
];

const WHITELIST_DOMAINS = [
  "swap.blocto.app",
  "swap-bot.blocto.app",
  "swap-premainnet.blocto.app",
  "swap-staging.blocto.app",
  "swap-dev.blocto.app",
  "swap-testnet.blocto.app",
  "thingfund.blocto.app",
  "port.onflow.org",
  // 'caa.blocto.app',
  // 'flow-wallet.blocto.app',
  // 'localhost:3000',
];

const WHITELIST_TXS = [
  "a0fa63b8aa3691b576ddd63102fe6230866536b27d2b6cba0264fe51b81d31d4", // Exact FLOW -> tUSDT
  "a9b83cb8c8cfbc06c1c13ceb90440503b9589f849608961fb4e142c568e8d75f", // Exact tUSDT -> FLOW
  "2fd5cef1d4edd424857a8fc682a27aced04637b08d052671ff09febd5548acb7", // FLOW -> Exact tUSDT
  "dd873946d5476283ac8575da347f4e7b5aef9da3fb6934b53651445276d868df", // tUSDT -> Exact FLOW
  "a2da8d26db559f2d96f05f1b2f6a4751b7245a758493dfd4260fc2830c115929", // Add FLOW:tUSDT
  "a90fd86891cc6b43ea257dc6567dfa3028270ce2fc3449ff346f7fc94140962a", // Remove FLOW:tUSDT
  "36c5ac6067ba2d2c15f0de1267e4c245d1bcdb21d6e748ef8c920a8b942ffd3a", // Enable tUSDT
  "5234b7dd02e3fa7df2700e6059907822b08093485270d88329300b70894dbc45", // Teleport tUSDT -> USDT
  "e29dc443dd34324c9d3c7110c0f9d9648093e19c561cdc619477647f1f1a1c57", // Enemy Metal purchase
  "1e2f8af8110694abe69f80e6eb5209738eaf66e9d5009f84a955ec73fc1ef69f", // Enemy Metal purchase type 2
  "d78a990f91560f2ae330ac976ac2e79aa9042f32b469d57039797b19c9407c6d", // Exact FUSD -> FLOW
  "42a18d0d669f717e7776c6b2a4b7e107cec629141522a08e9554fd901e73a3f5", // FUSD -> Exact FLOW
  "feee420724536494b9052532ba9789f770bdeac53ca9837082770158696fe149", // [Flow Port] Create machine account
  "21b384a62f170dc5287ae8c362a8eb099e7c035be58bd51ed549a348e7fd2d4d", // [Flow Port] Register node
];

const isMaliciousTx = (
  transaction: FlowTransaction,
  domain = "unknown.com"
) => {
  // Check required fields
  if (!transaction) {
    return true;
  }

  if (!transaction.voucher) {
    return true;
  }

  if (!transaction.voucher.authorizers) {
    return true;
  }

  const script = transaction.voucher.cadence;

  if (!script) {
    return true;
  }

  if (WHITELIST_DOMAINS.includes(domain)) {
    return false;
  }

  const hash: string = hashMsg(script).toString("hex");
  const recognizedTxs = getTransactions() || {};
  if (WHITELIST_TXS.includes(hash) || recognizedTxs[hash]) {
    return false;
  }

  // Skip security check for testnet
  if (IS_TESTNET || IS_SANDBOXNET) {
    return false;
  }

  // Check authorizers
  let isServiceAddrPresent = false;
  let isBypassed = false;
  transaction.voucher.authorizers.forEach((auth) => {
    if (auth.indexOf(BLOCTO_ADDRESS.replace(/^0x/, "")) !== -1) {
      isServiceAddrPresent = true;
    }

    WHITELIST_ADDRS.forEach((addr) => {
      if (auth.indexOf(addr) !== -1) {
        isBypassed = true;
      }
    });
  });

  // Reject if Blocto service account is used as authorizer
  if (isServiceAddrPresent) {
    return true;
  }

  // Accept if target address is in whitelist
  if (isBypassed) {
    return false;
  }

  // Check malicious scripts
  if (
    script.indexOf(".addPublicKey") !== -1 &&
    script.indexOf("machineAccount.addPublicKey") === -1
  ) {
    return true;
  }

  if (
    script.indexOf("publicKey") !== -1 &&
    script.indexOf(".keys") !== -1 &&
    script.indexOf(".add") !== -1
  ) {
    return true;
  }

  if (script.indexOf(".removePublicKey") !== -1) {
    return true;
  }

  if (script.indexOf(".keys") !== -1 && script.indexOf(".revoke") !== -1) {
    return true;
  }

  if (
    script.indexOf("BloctoPass") !== -1 &&
    script.indexOf(".withdraw") !== -1 &&
    script.indexOf("withdrawID") !== -1
  ) {
    return true;
  }

  return false;
};

export default isMaliciousTx;
