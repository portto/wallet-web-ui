import * as fcl from "@onflow/fcl";
import { KEY_DEVICE_KEY, getItem } from "src/services/LocalStorage";
import { cosignerAuth } from "../cosignerAuth";
import { getDeviceAuth } from "../getDeviceAuth";
import { getLatestBlock } from "../getLatestBlock";
import { payerAuth } from "../payerAuth";
import { FLOW_USD_ADDRESS, FUNGIBLE_TOKEN_ADDRESS } from "./constants";

const SCRIPT_ENABLE_FUSD = `\
// This transaction is a template for a transaction
// to add a Vault resource to their account
// so that they can use the FUSD

import FUSD from ${FLOW_USD_ADDRESS}
import FungibleToken from ${FUNGIBLE_TOKEN_ADDRESS}

transaction {

  prepare(signer: AuthAccount) {

    // If the account is already set up that's not a problem, but we don't want to replace it
    if(signer.borrow<&FUSD.Vault>(from: /storage/fusdVault) != nil) {
        return
    }
    
    // Create a new FUSD Vault and put it in storage
    signer.save(<-FUSD.createEmptyVault(), to: /storage/fusdVault)

    // Create a public capability to the Vault that only exposes
    // the deposit function through the Receiver interface
    signer.link<&FUSD.Vault{FungibleToken.Receiver}>(
        /public/fusdReceiver,
        target: /storage/fusdVault
    )

    // Create a public capability to the Vault that only exposes
    // the balance field through the Balance interface
    signer.link<&FUSD.Vault{FungibleToken.Balance}>(
        /public/fusdBalance,
        target: /storage/fusdVault
    )
  }
}
`;

export const enableFusd = (address: string) => {
  const deviceKey = getItem(KEY_DEVICE_KEY);
  const deviceAuth = getDeviceAuth(address, deviceKey);
  return getLatestBlock()
    .then((block) =>
      fcl.send([
        fcl.transaction(SCRIPT_ENABLE_FUSD),
        fcl.limit(1000),
        fcl.proposer(deviceAuth),
        fcl.authorizations([deviceAuth, cosignerAuth]),
        fcl.payer(payerAuth),
        fcl.ref(block.id),
      ])
    )
    .then(({ transactionId }: { transactionId: string }) =>
      fcl.tx(transactionId).onceSealed()
    );
};
