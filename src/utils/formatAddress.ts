const RESERVE_CHAR_COUNT = 8;

const formatAddress = (address = "") => {
  const splittedAddress = address.split("");
  splittedAddress.splice(
    RESERVE_CHAR_COUNT,
    splittedAddress.length - RESERVE_CHAR_COUNT * 2,
    "..."
  );
  return splittedAddress.join("");
};

export default formatAddress;
