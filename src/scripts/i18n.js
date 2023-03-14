import enTranslationMessages from "../translations/en.json";
import jaTranslationMessages from "../translations/ja.json";
import koTranslationMessages from "../translations/ko.json";
import ruTranslationMessages from "../translations/ru.json";
import zhCnTranslationMessages from "../translations/zh-Hans.json";
import zhTranslationMessages from "../translations/zh-Hant.json";

export const LOCALE_EN = "en";
export const LOCALE_ZH_TW = "zh-Hant";
export const LOCALE_ZH_CN = "zh-Hans";
export const LOCALE_JP = "ja";
export const LOCALE_KO = "ko";
export const LOCALE_RU = "ru";
export const DEFAULT_LOCALE = LOCALE_EN;

export const appLocales = [
  LOCALE_EN,
  LOCALE_ZH_TW,
  LOCALE_ZH_CN,
  LOCALE_JP,
  LOCALE_KO,
  LOCALE_RU,
];

const translationMessages = {
  [LOCALE_EN]: enTranslationMessages,
  [LOCALE_ZH_TW]: zhTranslationMessages,
  [LOCALE_ZH_CN]: zhCnTranslationMessages,
  [LOCALE_JP]: jaTranslationMessages,
  [LOCALE_KO]: koTranslationMessages,
  [LOCALE_RU]: ruTranslationMessages,
};

export default translationMessages;
