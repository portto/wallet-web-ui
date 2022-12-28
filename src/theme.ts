import boTheme from "@blocto/web-chakra-theme";
import { extendTheme } from "@chakra-ui/react";
import merge from "lodash.merge";

export const FONT_DEFAULT =
  "Work Sans, Helvetica Neue, Helvetica, Arial, sans-serif";

const IS_PROD = process.env.ENV === "production";

const theme = extendTheme(
  merge(boTheme, {
    colors: {
      accent: {
        border: IS_PROD ? "transparent" : "#FFECB0",
        text: IS_PROD ? "transparent" : "#FFB200",
      },
    },
    styles: {
      global: {
        "html body": {
          minHeight: "100%",
          width: "100%",
          background: "rgba(0,0,0,.3)",
        },
        body: {
          color: "#141414",
          fontSize: 14,
          lineHeight: "20px",
          fontFamily:
            "'Work Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif",
          textRendering: "geometricPrecision",
        },
        "body.fontLoaded": {
          fontFamily: FONT_DEFAULT,
        },
        button: {
          textRendering: "geometricPrecision",
        },
      },
    },
  })
);

export default theme;
