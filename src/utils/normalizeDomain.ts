const normalizeDomain = (urlOrDomain?: string) => {
  if (!urlOrDomain) return;
  // if it starts with http prefix, it's a url
  if (urlOrDomain.startsWith("http://") || urlOrDomain.startsWith("https://")) {
    return new URL(urlOrDomain).host;
  }
  // return as domain
  return urlOrDomain;
};

export default normalizeDomain;
