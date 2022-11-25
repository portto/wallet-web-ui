// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

const IS_LOCAL = process.env.NEV === "local" || !process.env.NEV;
// load ga
export const loadGA = () => {
  // istanbul ignore next
  window.ga=window.ga||function(){(ga.q=ga.q||[]).push(arguments)};ga.l=+new Date; // eslint-disable-line

  window.ga("create", process.env.REACT_APP_GA_UA, "auto");
};

export const sendPageView = (path) => {
  if (IS_LOCAL) {
    console.debug(`[GA-PV]: ${path}`);
  } if (window.ga) {
    window.ga("send", "pageview", path);
  }
};
