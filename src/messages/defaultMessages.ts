export interface Message {
  [key: string]: string;
}

// the format of messages are: { intlKey: "defaultMessage"}
const messages: Message = {
  // Authn
  "feature.authn.confirm.title": "Request account with",
  "app.genaral.email": "Email",
  "app.genaral.address": "{chain} Address",
  "app.genaral.approve": "Approve",
  "feature.authn.confirm.useAnotherAccount": "Use Another Account",
  // Authz
  "feature.sign.nonCustodial.title": "Please verify in Blocto app",
  "feature.sign.nonCustodial.description":
    "Approve the signing request from Blocto app...",
};

export default messages;
