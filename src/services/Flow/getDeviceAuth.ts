import { ec as EC } from "elliptic";
import { getUserAccount } from "./getUserAccount";
import { signWithKey } from "./signWithKey";

const ec = new EC("secp256k1");

export const publicFromPrivate = (privateKey: string) => {
  const key = ec.keyFromPrivate(Buffer.from(privateKey, "hex"));
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return key.getPublic().encode("hex").replace(/^04/, "");
};

export const getDeviceAuth =
  (address: string, deviceKey: string) =>
  async (
    account: { signature?: string; role?: { proposer?: unknown } } = {}
  ) => {
    const user = await getUserAccount(address);
    const devicePublicKey = publicFromPrivate(deviceKey);
    const key = user.keys.find(
      ({ publicKey }) => publicKey === devicePublicKey
    );

    if (!key) {
      return;
    }

    let sequenceNum;
    if (account.role?.proposer) sequenceNum = key.sequenceNumber || 0;

    const signingFunction = async (data: { message: string }) => ({
      addr: user.address,
      keyId: key.index,
      signature: signWithKey(deviceKey, data.message),
    });

    return {
      ...account,
      tempId: "DEVICE_KEY",
      addr: user.address,
      keyId: key.index,
      sequenceNum,
      signature: account.signature || null,
      signingFunction,
      resolve: null,
      roles: {
        proposer: true,
        authorizer: true,
        payer: true,
      },
    };
  };
