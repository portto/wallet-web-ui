import { getDappInfo, getDappMetadata } from "apis";

const fetchDappInfo = async ({
  id,
  url,
}: {
  id?: string;
  url?: string;
}): Promise<{ logo?: string; name?: string; url?: string }> => {
  const isFromLocalhost = !!url?.includes("localhost");
  if (id) {
    const { logo, name, web } = await getDappInfo({ id });
    return {
      logo,
      name,
      url: web.web_domain,
    };
  } else if (url && !isFromLocalhost) {
    const { result } = await getDappMetadata({ url });
    return {
      logo: result.thumbnail,
      name: result.title,
    };
  }
  return {};
};

export default fetchDappInfo;
