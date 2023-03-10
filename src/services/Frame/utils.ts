const IS_LOCAL =
  process.env.REACT_APP_ENV === "local" || !process.env.REACT_APP_ENV;

export const postMessageToParentFrame = (args: unknown, l6n: string) => {
  if (IS_LOCAL) {
    // eslint-disable-next-line no-console
    console.debug(`Post message to ${l6n}:`, args);
  }
  const parent = window.opener || window.parent;
  if (parent && parent.postMessage && l6n) {
    parent.postMessage(args, l6n);
  }
};
