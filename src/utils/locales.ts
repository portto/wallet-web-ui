import { parse } from "query-string";

import {
  DEFAULT_LOCALE,
  LOCALE_EN,
  LOCALE_ZH_TW,
  LOCALE_ZH_CN,
  LOCALE_JP,
  LOCALE_KO,
  LOCALE_RU,
} from "i18n";
import { getItem, KEY_LANGUAGE } from "services/LocalStorage";
import localeNames from "translations/localeNames.json";

const LocaleMap = (lang: string) => ({
  "en-US": LOCALE_EN,
  "zh-TW": LOCALE_ZH_TW,
  "zh-CN": LOCALE_ZH_CN,
  "ja-JP": LOCALE_JP,
  en: LOCALE_EN,
  zh: LOCALE_ZH_TW,
  ja: LOCALE_JP,
  ko: LOCALE_KO,
  ru: LOCALE_RU,
})[lang];

const normalizeIsoCode = (str = "") => { // To ensure all browsers' iso code are the same.
  const [language, country] = str.split("-");
  if (language && country) {
    return `${language.toLowerCase()}-${country.toUpperCase()}`;
  }
  return language.toLowerCase();
};

export const getLocale = () => {
  const overrideLocale = parse(window.location.search).locale;
  const prevLanguage = getItem(KEY_LANGUAGE);

  if (prevLanguage && !overrideLocale) {
    return prevLanguage;
  }

  const navigatorLanguage = (navigator.languages && navigator.languages[0]) || navigator.language;
  // @ts-expect-error weird typing issue
  const rawLang = normalizeIsoCode(overrideLocale || navigatorLanguage);
  const mappedLang = LocaleMap(rawLang)
    || LocaleMap(rawLang.split("-")[0])
    || DEFAULT_LOCALE;

  return mappedLang;
};

export const getTransactionLocale = () => {
  const navigatorLanguage = (navigator.languages && navigator.languages[0]) || navigator.language;
  const rawLang = normalizeIsoCode(navigatorLanguage);

  return rawLang.replace("-", "_");
};

export const mapLanguageCodeToLocalName = (langCode: string) =>
  // @ts-expect-error ignore this
  localeNames[langCode] || `[${langCode}]`;
