import FontFaceObserver from "fontfaceobserver";

export { loadGA } from "./services/GoogleAnalytics";
export { initAmplitude } from "./services/Amplitude";
export { initSentry } from "./services/Sentry";

export function initFontObserver() {
  // Observe loading of Work Sans (to remove open sans, remove the <link> tag in
  // the index.html file and this observer)
  const fontObserver = new FontFaceObserver("Work Sans", {});

  // When Work Sans is loaded, add a font-family using Work Sans to the body
  fontObserver.load().then(() => {
    document.body.classList.add("fontLoaded");
  });
}

export function runIntlPolyfill(callback: () => void) {
  // Chunked polyfill for browsers without Intl support
  if (!window.Intl) {
    new Promise((resolve) => {
      resolve(import("intl"));
    })
      .then(() =>
        Promise.all([
          // @ts-expect-error no type definition needed for locale files
          import("intl/locale-data/jsonp/en"),
          // @ts-expect-error no type definition needed for locale files
          import("intl/locale-data/jsonp/de"),
        ])
      )
      .then(callback)
      .catch((err) => {
        throw err;
      });
  } else {
    callback();
  }
}
