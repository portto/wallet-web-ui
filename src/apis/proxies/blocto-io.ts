import { apiGet } from "../axios";

// A proxy to blocto.io (blocto-webapp) to crawl dapp info from web metadata tags,
// will be deprecated once developer dashboard being properly set up
export const getDappMetadata = ({ url }: { url: string }) =>
  apiGet<{ result: { title: string; thumbnail: string } }>({
    url: "bloctoWeb/meta",
    request: {
      url,
    },
  });
