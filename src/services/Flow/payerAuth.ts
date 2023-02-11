import { signPayer } from "src/apis";
import { getUserAccount } from "./getUserAccount";

const payerSigningFunction = (payerId: string) => (data: { message: string }) =>
  new Promise((resolve) => {
    signPayer({ data: data.message, payerId }).then(
      ({ signature, address, id }) => {
        resolve({
          addr: address,
          keyId: id,
          signature,
        });
      }
    );
  });

let sessionPayerInfo: {
  id: number;
  address: string;
  payer_id: string;
} | null = null;

export const payerAuth = async (account: { signature?: string } = {}) =>
  new Promise((resolve, reject) => {
    const getPayerInfo = !sessionPayerInfo
      ? signPayer
      : () => Promise.resolve(sessionPayerInfo!); // eslint-disable-line @typescript-eslint/no-non-null-assertion

    getPayerInfo({ data: "ffff" })
      .then(({ id, address, payer_id }) => {
        sessionPayerInfo = { id, address, payer_id };

        getUserAccount(address).then((user) => {
          const key = user.keys.find(({ index }) => index === id);

          if (!key) {
            return reject();
          }
          resolve({
            ...account,
            tempId: "PAYER_ACCOUNT",
            addr: address.replace("0x", ""),
            keyId: id,
            sequenceNum: key.sequenceNumber,
            signature: account.signature || null,
            signingFunction: payerSigningFunction(payer_id),
            resolve: null,
            roles: {
              proposer: true,
              authorizer: false,
              payer: true,
            },
          });
        });
      })
      .catch(reject);
  });
