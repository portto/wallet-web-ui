import { acquireAccessToken, login } from "src/apis";

const loginAndAcquireToken = async ({
  email,
  authCode,
  authCodeId,
  totpCode,
  chain,
}: {
  email: string;
  authCode: string;
  authCodeId: string;
  totpCode?: string;
  chain: string;
}) => {
  // login API returns a temp jwt and it has to be converted
  // to real user access token through acquireAccessToken PI
  const { jwt: tmpJWT } = await login({
    email,
    authCode,
    authCodeId,
    totpCode,
  });
  // check if current user is access through FCL
  // @todo: find more elegant way
  const isFCL = !chain || chain === "flow";
  return acquireAccessToken({ jwt: tmpJWT, isSdk: !isFCL });
};

export default loginAndAcquireToken;
