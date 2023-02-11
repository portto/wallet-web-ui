import * as fcl from "@onflow/fcl";
import * as t from "@onflow/types";
import {
  NON_FUNGIBLE_TOKEN_ADDRESS,
  YAHOO_COLLECTIBLE_ADDRESS,
} from "./constants";

const SCRIPT_CHECK_COLLECTION_ENABLED = `\
import NonFungibleToken from ${NON_FUNGIBLE_TOKEN_ADDRESS}
import YahooCollectible from ${YAHOO_COLLECTIBLE_ADDRESS}

pub fun main(account: Address): Bool {
    let publicRef = getAccount(account).getCapability(YahooCollectible.CollectionPublicPath)!
        .borrow<&{NonFungibleToken.CollectionPublic, YahooCollectible.CollectionPublic}>()

    return publicRef != nil
}
`;

export const checkCollectionEnabled = (address: string) =>
  fcl
    .send([
      fcl.script(SCRIPT_CHECK_COLLECTION_ENABLED), // @todo: get the scripts about enabling collection from api.
      fcl.args([fcl.arg(address, t.Address)]),
    ])
    .then(fcl.decode);
