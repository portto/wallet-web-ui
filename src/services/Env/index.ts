export const IS_LOCAL = process.env.ENV === "local" || !process.env.ENV;
export const IS_STAGING = process.env.ENV === "staging" || !process.env.ENV;