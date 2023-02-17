import { IS_SANDBOXNET, IS_TESTNET } from "src/services/Env";
import { apiPost } from "./axios";

export const getLatestBlock = () =>
  apiPost<{ result: { baseFeePerGas: string } }>({
    baseURL:
      IS_TESTNET || IS_SANDBOXNET
        ? "https://rinkeby.blocto.app"
        : "https://mainnet.infura.io/v3/55b0bda240044d149de944863519ae3e",
    request: {
      jsonrpc: "2.0",
      method: "eth_getBlockByNumber",
      params: ["latest", true],
      id: 1,
    },
  });
