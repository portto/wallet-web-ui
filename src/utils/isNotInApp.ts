import { Chains } from "src/types";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const isNotInApp = (blockchain: Chains) => !window[blockchain]?.isBlocto;

export default isNotInApp;
