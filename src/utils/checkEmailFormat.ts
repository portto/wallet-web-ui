const EMAIL_REGEX =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const CAP_REGEX = /[A-Z]+/;

export const checkEmailFormat = (input: string) => EMAIL_REGEX.test(input);

export const checkEmailCap = (input: string) => !CAP_REGEX.test(input);
