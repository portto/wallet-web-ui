const IS_LOCAL = process.env.ENV === "local" || !process.env.ENV;

export const postMessageToParentFrame = (args: any, l6n: string) => {
  if (IS_LOCAL) {
    console.debug(`Post message to ${l6n}:`, args);
  }
  const parent = window.opener || window.parent;
  if (parent && parent.postMessage) {
    parent.postMessage(args, l6n);
  }
};
