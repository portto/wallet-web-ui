import * as fcl from "@onflow/fcl";
import * as t from "@onflow/types";
import { LOCKED_FLOW_ADDRESS } from "./constants";

const SCRIPT_GET_LOCKED_ADDRESS = `
import LockedTokens from ${LOCKED_FLOW_ADDRESS}

pub fun main(account: Address): Address {

  let lockedAccountInfoRef = getAccount(account)
    .getCapability<&LockedTokens.TokenHolder{LockedTokens.LockedAccountInfo}>(LockedTokens.LockedAccountInfoPublicPath)
    .borrow() ?? panic("Could not borrow a reference to public LockedAccountInfo")

  return lockedAccountInfoRef.getLockedAccountAddress()
}
`;

export const getLockedAddress = (address: string) =>
  fcl
    .send([
      fcl.script(SCRIPT_GET_LOCKED_ADDRESS),
      fcl.args([fcl.arg(address, t.Address)]),
    ])
    .then(fcl.decode);
