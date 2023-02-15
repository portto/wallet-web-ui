import {
  AptosSignatureDetails,
  AptosTransaction,
  AptosUpdateSignatureDetailsResponse,
  Chains,
  EVMSignatureDetails,
  EVMUpdateSignatureDetailsResponse,
  EvmTransaction,
  FlowSignatureDetails,
  FlowTransaction,
  FlowUpdateSignatureDetailsResponse,
} from "src/types";
import { apiGet, apiPost, apiPut } from "./axios";

export const getMaintenanceStatus = (chain: string) =>
  apiGet<{ isUnderMaintenance: boolean }>({
    url: "api/isUnderMaintenance",
    request: {
      chain,
    },
  });

export const createHandshake = (params: any) =>
  apiPost<{
    paddr: string;
    code: string;
    signatures: string[];
  }>({
    url: "api/createHandshake",
    request: params,
    isAuthorized: true,
  });

export const createAuthnQueue = () =>
  apiPost({
    url: "api/authn-queue",
    isAuthorized: true,
  });

export const getAuthnQueue = (queueId: number) =>
  apiGet<{
    queueNumber: number;
    readyNumber: number;
    time: number;
  }>({
    url: "api/authn-queue",
    request: {
      queueId,
    },
    isAuthorized: true,
  });

export const estimatePoint = ({
  sessionId,
  blockchain = "ethereum",
  rawObject,
}: {
  sessionId: string;
  blockchain: string;
  rawObject: any;
}) =>
  apiPost<{
    cost?: string;
    discount?: string;
    error_code?: string;
    chain_error_msg?: string;
  }>({
    url: `api/${blockchain}/estimatePoint`,
    request: {
      sessionId,
      ...rawObject,
    },
    isAuthorized: true,
  });

export const signEthereumMessage = ({
  chain = "ethereum",
  message,
  sessionId,
}: {
  chain: string;
  message: string;
  sessionId: string;
}) =>
  apiPost<{ signature: string }>({
    url: `api/${chain}/sign`,
    request: {
      message: `0x${message}`,
      sessionId,
    },
    isAuthorized: true,
  });

export const signAptosMessage = ({
  message,
  sessionId,
}: {
  message: string;
  sessionId: string;
}) =>
  apiPost({
    url: "api/aptos/sign",
    request: {
      message,
      sessionId,
    },
    isAuthorized: true,
  });

export const getSignatureDetails = ({
  blockchain,
  signatureId,
  sessionId,
}: {
  blockchain: Chains;
  signatureId: string;
  sessionId: string;
}) =>
  apiGet<FlowSignatureDetails | EVMSignatureDetails | AptosSignatureDetails>({
    url: `api/${blockchain}/signature-details`,
    request: {
      signatureId,
      sessionId,
    },
    isAuthorized: true,
  });

export const updateSignatureDetails = ({
  signatureId,
  sessionId,
  action,
  blockchain,
}: {
  signatureId: string;
  sessionId: string;
  action: string;
  blockchain: Chains;
}) =>
  apiPut<
    | FlowUpdateSignatureDetailsResponse
    | EVMUpdateSignatureDetailsResponse
    | AptosUpdateSignatureDetailsResponse
  >({
    url: `api/${blockchain}/user-signature`,
    request: {
      signatureId,
      sessionId,
      action,
    },
    isAuthorized: true,
  });

export const getAuthorization = ({
  authorizationId,
  blockchain = "flow",
}: {
  authorizationId: string;
  blockchain: string;
}) =>
  apiGet<{
    sessionId: string;
    status: "PENDING" | "APPROVED" | "DECLINED";
    reason: string | null;
    transactionHash: string | null;
    transactions?: EvmTransaction[];
    transaction?: string | FlowTransaction | AptosTransaction;
    convertedTx?: string;
    extraSignatures?: object;
  }>({
    url: `api/${blockchain}/authzDetails`,
    request: {
      authorizationId,
    },
    isAuthorized: true,
  });

export const updateAuthentication = ({
  authenticationId,
  action,
  blockchain = "flow",
  data,
}: {
  authenticationId: string;
  action: string;
  blockchain: string;
  data?: any;
}) =>
  apiPut({
    url: `api/${blockchain}/authn`,
    request: {
      authenticationId,
      action,
      data,
    },
    isAuthorized: true,
  });

export const updatePreAuthz = ({
  preauthId,
  action,
  blockchain = "flow",
}: {
  preauthId: string;
  action: string;
  blockchain: string;
}) =>
  apiPut({
    url: `api/${blockchain}/pre-authz`,
    request: {
      preauthId,
      action,
    },
    isAuthorized: true,
  });

export const checkPreAuthzQueue = ({
  preauthId,
  blockchain = "flow",
}: {
  preauthId: string;
  blockchain: string;
}) =>
  apiGet({
    url: `api/${blockchain}/pre-authz-queue`,
    request: {
      preauthId,
    },
    isAuthorized: true,
  });

type NewType = string[];

export const createDAppAuthorization = ({
  sessionId,
  blockchain = "flow",
  message,
  isInvokeWrapped,
  publicKeySignaturePairs,
  appendTx,
}: {
  sessionId: string;
  blockchain: string;
  message: string;
  isInvokeWrapped: boolean;
  publicKeySignaturePairs: string[];
  appendTx: NewType;
}) =>
  apiPost({
    url: `api/${blockchain}/authz-dapp`,
    request: {
      sessionId,
      message,
      isInvokeWrapped,
      publicKeySignaturePairs,
      appendTx,
    },
    isAuthorized: true,
  });

export const updateAuthorization = ({
  authorizationId,
  action,
  sessionId,
  blockchain = "flow",
  cost,
  discount,
}: any) =>
  apiPut({
    url: `api/${blockchain}/authz`,
    request: {
      authorizationId,
      action,
      sessionId,
      cost,
      discount,
    },
    isAuthorized: true,
  });

export const updateNonCustodial = ({
  authorizationId,
  sessionId,
  blockchain = "flow",
}: any) =>
  apiPut({
    url: `api/${blockchain}/non-custodial`,
    request: {
      authorizationId,
      sessionId,
    },
    isAuthorized: true,
  });
