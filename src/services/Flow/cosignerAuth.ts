import { signTransaction } from "src/apis";

const signingFunction = (data: { message: string }) =>
  new Promise((resolve) => {
    signTransaction({ data: data.message }).then(
      ({ signature, id, address }) => {
        resolve({
          addr: address,
          keyId: id,
          signature,
        });
      }
    );
  });

export const cosignerAuth = (account: { signature?: string } = {}) =>
  new Promise((resolve) => {
    signTransaction({ data: "ffff" }).then(({ id, address }) => {
      resolve({
        ...account,
        tempId: "COSIGNER_KEY",
        addr: address.replace("0x", ""),
        keyId: id,
        sequenceNum: 0,
        signature: account.signature || null,
        signingFunction,
        resolve: null,
        roles: {
          proposer: false,
          authorizer: true,
          payer: true,
        },
      });
    });
  });
