/**
 * app.js
 *
 * This is the entry file for the application, only setup and boilerplate
 * code.
 */

// Import all the third party stuff
import { createRoot } from "react-dom/client";
import reportWebVitals from "./reportWebVitals";

import { ChakraProvider } from "@chakra-ui/react";
import { IntlProvider } from "react-intl";
import { BrowserRouter as Router } from "react-router-dom";
import { getLocale } from "./utils/locales";

// Import root app
import App from "./App";

// Import i18n messages
import translationMessages from "./i18n";
// Import Custom theme
import theme from "./theme";
// Import initializers
import {
  initFontObserver,
  runIntlPolyfill,
  loadGA,
  initAmplitude,
  initSentry,
} from "./initializers";
import initMocks from "mocks/index";

loadGA();
initAmplitude();
initSentry();

initFontObserver();
initMocks();

const defaultLocale = getLocale();

const root = createRoot(document.getElementById("root")!);

const render = (messages: any) => {
  root.render(
    <ChakraProvider theme={theme}>
      <IntlProvider
        locale={defaultLocale}
        defaultLocale="en"
        messages={messages[defaultLocale]}
      >
        <Router>
          <App />
        </Router>
      </IntlProvider>
    </ChakraProvider>
  );
};

runIntlPolyfill(() => render(translationMessages));
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
