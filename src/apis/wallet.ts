import { KEY_ACCESS_TOKEN, getItem } from "src/services/LocalStorage";
import {
  AptosSignatureDetails,
  AptosTransaction,
  AptosUpdateSignatureDetailsResponse,
  Chains,
  CompositeSignature,
  EVMSignatureDetails,
  EVMUpdateSignatureDetailsResponse,
  EvmTransaction,
  FlowAuthentication,
  FlowSignatureDetails,
  FlowTransaction,
  FlowUpdateSignatureDetailsResponse,
  TransactionFeeOption,
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
    signatures: CompositeSignature[];
  }>({
    url: "api/createHandshake",
    request: {
      accessToken: getItem(KEY_ACCESS_TOKEN),
      ...params,
    },
  });

export const createAuthnQueue = () =>
  apiPost({
    url: "api/authn-queue",
    withAccessToken: true,
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
    withAccessToken: true,
  });

export const getAuthn = (authenticationId: string) =>
  apiGet<FlowAuthentication | null>({
    url: "api/flow/authn-details",
    request: {
      authenticationId,
    },
  });

export const estimatePoint = ({
  blockchain = Chains.ethereum,
  rawObject,
}: {
  blockchain: Chains;
  rawObject: object;
}) =>
  apiPost<{
    cost?: string;
    discount?: string;
    error_code?: string;
    chain_error_msg?: string;
    options: TransactionFeeOption[];
  }>({
    url: `api/${blockchain}/estimatePoint`,
    request: rawObject,
    withSession: true,
  });

export const signEthereumMessage = ({
  chain = "ethereum",
  message,
}: {
  chain: string;
  message: string;
}) =>
  apiPost<{ signature: string }>({
    url: `api/${chain}/sign`,
    request: {
      message: `0x${message}`,
    },
    withAccessToken: true,
  });

export const signAptosMessage = ({ message }: { message: string }) =>
  apiPost({
    url: "api/aptos/sign",
    request: {
      message,
    },
    withAccessToken: true,
  });

export const createSignatureDetails = ({
  blockchain,
  message,
  method,
}: {
  blockchain: Chains;
  message: string;
  method: string;
}) =>
  apiPost<{ signatureId: string; status: "PENDING"; reason: null }>({
    url: `api/${blockchain}/user-signature`,
    request: {
      message,
      method,
    },
    withSession: true,
  });

export const getSignatureDetails = ({
  blockchain,
  signatureId,
}: {
  blockchain: Chains;
  signatureId: string;
}) =>
  apiGet<FlowSignatureDetails | EVMSignatureDetails | AptosSignatureDetails>({
    url: `api/${blockchain}/signature-details`,
    request: {
      signatureId,
    },
    withSession: true,
  });

export const updateSignatureDetails = ({
  signatureId,
  action,
  blockchain,
}: {
  signatureId: string;
  blockchain: Chains;
  action: "approve" | "decline";
}) =>
  apiPut<
    | FlowUpdateSignatureDetailsResponse
    | EVMUpdateSignatureDetailsResponse
    | AptosUpdateSignatureDetailsResponse
  >({
    url: `api/${blockchain}/user-signature`,
    request: {
      signatureId,
      action,
    },
    withAccessToken: true,
    withSession: true,
  });

export const getAuthorization = ({
  authorizationId,
  blockchain = "flow",
}: {
  authorizationId: string;
  blockchain: string;
}) =>
  apiGet<{
    status: "PENDING" | "APPROVED" | "DECLINED";
    reason: string | null;
    transactionHash: string | null;
    transactions?: EvmTransaction[];
    transaction?: string | FlowTransaction | AptosTransaction;
    convertedTx?: string;
    extraSignatures?: object;
    requestId?: string; // This is for SDK fallback
  }>({
    url: `api/${blockchain}/authzDetails`,
    request: {
      authorizationId,
    },
    withAccessToken: true,
    withSession: true,
  });

export const updateAuthentication = ({
  authenticationId,
  action,
  blockchain = Chains.flow,
  data,
}: {
  authenticationId: string;
  action: "approve" | "decline";
  blockchain: Chains;
  data?: any;
}) =>
  apiPut({
    url: `api/${blockchain}/authn`,
    request: {
      authenticationId,
      action,
      data,
    },
    withAccessToken: true,
  });

export const updatePreAuthz = ({
  preauthId,
  action,
  blockchain = Chains.flow,
}: {
  preauthId: string;
  action: "approve" | "decline";
  blockchain: Chains;
}) =>
  apiPut({
    url: `api/${blockchain}/pre-authz`,
    request: {
      preauthId,
      action,
    },
    withAccessToken: true,
  });

export const checkPreAuthzQueue = ({
  preauthId,
  blockchain = "flow",
}: {
  preauthId: string;
  blockchain: string;
}) =>
  apiGet<{
    queueNumber: number;
    readyNumber: number;
  }>({
    url: `api/${blockchain}/pre-authz-queue`,
    request: {
      preauthId,
    },
    withSession: true,
  });

export const createDAppAuthorization = ({
  blockchain = "flow",
  message,
  isInvokeWrapped,
  publicKeySignaturePairs,
  appendTx,
}: {
  blockchain: string;
  message: string;
  isInvokeWrapped: boolean;
  publicKeySignaturePairs: Record<string, string>;
  appendTx: Record<string, string>;
}) =>
  apiPost<{
    authorizationId: string;
    status: "PENDING";
    reason: null;
    transactionHash: null;
  }>({
    url: `api/${blockchain}/authz-dapp`,
    request: {
      message,
      isInvokeWrapped,
      publicKeySignaturePairs,
      appendTx,
    },
    withSession: true,
  });

export const createAuthorization = ({
  txs,
  blockchain = "ethereum",
  isInDApp,
}: any) =>
  apiPost<{
    authorizationId: string;
    status: "PENDING";
    reason: null;
    transactionHash: null;
  }>({
    url: `api/${blockchain}/authz?isInDApp=${isInDApp}`,
    request: txs,
    withSession: true,
  });

export const updateAuthorization = ({
  authorizationId = "",
  action,
  blockchain = Chains.flow,
  cost = 0,
  discount = 0,
  type = "point",
}: {
  authorizationId: string;
  action: "decline" | "approve";
  blockchain: Chains;
  cost?: number;
  discount?: number;
  type?: string;
}) =>
  apiPut({
    url: `api/${blockchain}/authz`,
    request: {
      authorizationId,
      action,
      cost,
      discount,
      type,
    },
    withAccessToken: true,
    withSession: true,
  });

export const updateNonCustodial = ({
  authorizationId,
  blockchain = "flow",
}: any) =>
  apiPut({
    url: `api/${blockchain}/non-custodial`,
    request: {
      authorizationId,
    },
    withAccessToken: true,
  });

export const createSharedAccount = () =>
  apiPost<{ request_id: string; tx_hash: string }>({
    url: "api/flow/create-script",
    withAccessToken: true,
  });
