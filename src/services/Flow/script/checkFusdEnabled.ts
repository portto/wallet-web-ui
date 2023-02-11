import * as fcl from "@onflow/fcl";
import * as t from "@onflow/types";
import { FLOW_USD_ADDRESS, FUNGIBLE_TOKEN_ADDRESS } from "./constants";

const SCRIPT_CHECK_FUSD_ENABLED = `\
import FUSD from ${FLOW_USD_ADDRESS}
import FungibleToken from ${FUNGIBLE_TOKEN_ADDRESS}

pub fun main(account: Address): Bool {
    let receiverRef = getAccount(account).getCapability(/public/fusdReceiver)
        .borrow<&FUSD.Vault{FungibleToken.Receiver}>()

    return receiverRef != nil
}
`;

export const checkFusdEnabled = (address: string) =>
  fcl
    .send([
      fcl.script(SCRIPT_CHECK_FUSD_ENABLED),
      fcl.args([fcl.arg(address, t.Address)]),
    ])
    .then(fcl.decode);
