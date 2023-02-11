import * as fcl from "@onflow/fcl";
import { KEY_DEVICE_KEY, getItem } from "src/services/LocalStorage";
import { cosignerAuth } from "../cosignerAuth";
import { getDeviceAuth } from "../getDeviceAuth";
import { getLatestBlock } from "../getLatestBlock";
import { getNonCustodialAuth } from "../getNonCustodialAuth";
import { payerAuth } from "../payerAuth";
import {
  NON_FUNGIBLE_TOKEN_ADDRESS,
  YAHOO_COLLECTIBLE_ADDRESS,
} from "./constants";

const SCRIPT_ENABLE_COLLECTION = `\
import NonFungibleToken from ${NON_FUNGIBLE_TOKEN_ADDRESS}
import YahooCollectible from ${YAHOO_COLLECTIBLE_ADDRESS}

transaction {

    prepare(signer: AuthAccount) {
        if signer.borrow<&YahooCollectible.Collection>(from: YahooCollectible.CollectionStoragePath) == nil {

            let collection <- YahooCollectible.createEmptyCollection() as! @YahooCollectible.Collection

            signer.save(<-collection, to: YahooCollectible.CollectionStoragePath)

            signer.link<&YahooCollectible.Collection{NonFungibleToken.CollectionPublic, YahooCollectible.CollectionPublic}>(
                YahooCollectible.CollectionPublicPath,
                target: YahooCollectible.CollectionStoragePath)
        }
    }
}
`;
export const enableCollection = (address: string, url: string) => {
  const deviceKey = getItem(KEY_DEVICE_KEY);
  const deviceAuth = getDeviceAuth(address, deviceKey);
  const nonCustodialAuth = getNonCustodialAuth(address, "Pre-enable", "", url);

  return getLatestBlock()
    .then((block) =>
      fcl.send([
        fcl.transaction(SCRIPT_ENABLE_COLLECTION),
        fcl.limit(1000),
        fcl.proposer(deviceKey ? deviceAuth : payerAuth),
        fcl.authorizations([
          deviceKey ? deviceAuth : nonCustodialAuth,
          cosignerAuth,
        ]),
        fcl.payer(payerAuth),
        fcl.ref(block.id),
      ])
    )
    .then(({ transactionId }) => transactionId);
};
