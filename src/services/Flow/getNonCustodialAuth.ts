import { createSigningRequest, getSigningRequest } from "src/apis";
import { Chains, FlowNonCustodialSigningResponse } from "src/types";

const nonCustodialSigningFunction =
  (title: string, image: string, url: string) => (data: { message: string }) =>
    new Promise((resolve, reject) => {
      createSigningRequest({
        blockchain: Chains.flow,
        raw_payload: data.message,
        title,
        image,
        url,
      }).then(({ id }) => {
        const interval = setInterval(() => {
          getSigningRequest({ blockchain: Chains.flow, id })
            .then((result) => {
              const {
                status,
                address,
                signature,
                id: keyId,
              } = result as FlowNonCustodialSigningResponse;
              if (status === "pending") {
                return;
              }

              clearInterval(interval);

              if (status === "approve") {
                return resolve({
                  addr: address,
                  keyId,
                  signature,
                });
              }
              reject("rejected");
            })
            .catch(reject);
        }, 2000);
      });
    });

export const getNonCustodialAuth =
  (address: string, title: string, image: string, url: string) =>
  (account: { signature?: string } = {}) => ({
    ...account,
    tempId: "NON_CUSTODIAL_KEY",
    addr: address.replace("0x", ""),
    keyId: 2,
    sequenceNum: 0,
    signature: account.signature || null,
    signingFunction: nonCustodialSigningFunction(title, image, url),
    resolve: null,
    roles: {
      proposer: false,
      authorizer: true,
      payer: true,
    },
  });
