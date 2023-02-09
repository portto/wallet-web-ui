import { getDappInfo, getDappMetadata } from "src/apis";
import { DEFAULT_APP_ID } from "./constants";

const fetchFromURL = async (url?: string) => {
  const redirectUrl = document.referrer
    ? new URL(document.referrer).origin
    : "";
  const fetchingURL = url || redirectUrl;
  const isFromLocalhost = fetchingURL?.includes("localhost");

  if (fetchingURL && !isFromLocalhost) {
    try {
      const { result } = await getDappMetadata({ url: fetchingURL });
      return {
        logo: result.thumbnail,
        name: result.title,
        url: fetchingURL,
      };
    } catch (error) {
      return {};
    }
  }

  return {};
};

const fetchDappInfo = async ({
  id,
  url,
}: {
  id?: string;
  url?: string;
}): Promise<{ logo?: string; name?: string; url?: string }> => {
  if (id && id !== DEFAULT_APP_ID) {
    try {
      const { logo, name, web } = await getDappInfo({ id });
      return {
        logo,
        name,
        url: url || web.web_domain,
      };
    } catch (error) {
      // pass on
    }
  }

  return fetchFromURL(url);
};

export default fetchDappInfo;
