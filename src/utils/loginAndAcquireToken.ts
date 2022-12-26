import { acquireAccessToken, login } from "src/apis";
import {
  KEY_ACCESS_TOKEN,
  KEY_DEVICE_KEY,
  setItem,
} from "src/services/LocalStorage";

const loginAndAcquireToken = async ({
  email,
  authCode,
  authCodeId,
  totpCode,
  chain,
}: any) => {
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
  const { jwt, key } = await acquireAccessToken({ jwt: tmpJWT, isSdk: !isFCL });
  setItem(KEY_ACCESS_TOKEN, jwt);
  setItem(KEY_DEVICE_KEY, key);
  return { jwt, key };
};

export default loginAndAcquireToken;
