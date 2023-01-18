import { SHA3 } from "sha3";

export default function hashMsg(msg: string) {
  const sha = new SHA3(256);
  sha.update(Buffer.from(msg, "utf8"));
  return sha.digest();
}
