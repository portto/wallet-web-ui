import { uuid as uuidv4 } from "uuidv4";
import { signMoonPayUrl } from "src/apis";
import { IS_MAINNET } from "src/services/Env";

const MOONPAY_API_KEY = process.env.REACT_APP_MOONPAY_API_KEY;
const MOON_PAY_URL = `https://buy${IS_MAINNET ? "" : "-sandbox"}.moonpay.com/`;

const openPurchasePage = ({
  currency,
  address,
  email,
  userId,
}: {
  currency: string;
  address: string;
  email: string;
  userId: string;
}) => {
  const processedCurrency = IS_MAINNET ? currency.toLowerCase() : "eth";
  const query = `apiKey=${MOONPAY_API_KEY}&currencyCode=${processedCurrency}&baseCurrencyCode=usd&walletAddress=${address}&email=${email.replace(
    "@",
    "%40"
  )}&externalCustomerId=${userId}&externalTransactionId=${uuidv4()}`;

  const newTabInstance = window.open("");
  signMoonPayUrl({ query }).then(({ signature }) => {
    if (newTabInstance) {
      newTabInstance.location = `${MOON_PAY_URL}?${query}&signature=${encodeURIComponent(
        signature
      )}`;
    }
  });
};

export default openPurchasePage;
