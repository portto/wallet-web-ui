import { MessageDescriptor, defineMessages } from "react-intl";

export interface Message {
  [key: string]: MessageDescriptor;
}

const messages: Message = {
  // Authn
  "feature.authn.confirm.title": {
    id: "feature.authn.confirm.title",
    defaultMessage: "Request account with",
  },
  "app.genaral.email": {
    id: "app.genaral.email",
    defaultMessage: "Email",
  },
  "app.genaral.address": {
    id: "app.genaral.address",
    defaultMessage: "{chain} Address",
  },
  "app.genaral.approve": {
    id: "app.genaral.approve",
    defaultMessage: "Approve",
  },
  "feature.authn.confirm.useAnotherAccount": {
    id: "feature.authn.confirm.useAnotherAccount",
    defaultMessage: "Use Another Account",
  },
  // Authz
  "feature.sign.nonCustodial.title": {
    id: "feature.sign.nonCustodial.title",
    defaultMessage: "Please verify in Blocto app",
  },
  "feature.sign.nonCustodial.description": {
    id: "feature.sign.nonCustodial.description",
    defaultMessage: "Approve the signing request from Blocto app...",
  },
};

export default defineMessages({ ...messages });
