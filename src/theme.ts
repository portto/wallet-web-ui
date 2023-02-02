import boTheme from "@blocto/web-chakra-theme";
import { extendTheme } from "@chakra-ui/react";
import merge from "lodash.merge";

const IS_PROD = process.env.REACT_APP_ENV === "production";

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
        html: {
          fontSize: "16px",
        },
        "html body": {
          minHeight: "100%",
          width: "100%",
          background: "rgba(0,0,0,.3)",
        },
        body: {
          fontFamily: "boFontFamily.base",
          fontSize: "size.body.3",
          lineHeight: "line.height.body.3",
          color: "font.primary",
          textRendering: "geometricPrecision",
        },
        "body.fontLoaded": {
          fontFamily: "boFontFamily.base",
        },
        button: {
          textRendering: "geometricPrecision",
          WebkitTapHighlightColor: "transparent",
        },
        "[role=button]": {
          WebkitTapHighlightColor: "transparent",
        },
      },
    },
    components: {
      PinInput: {
        sizes: {
          md: {
            w: "45px",
            h: "45px",
            borderRadius: "12px",
          },
        },
        variants: {
          blocto: {
            color: "font.highlight",
            fontSize: "size.heading.1",
            fontWeight: "weight.l",
            bg: "background.primary",
            borderColor: "border.tertiary",
            borderWidth: "width.m",
            _hover: { borderColor: undefined },
            "&:focus:not([aria-invalid=true])": {
              borderWidth: "width.l",
              borderColor: "rgba(0, 117, 255, 0.54)",
            },
            "&[aria-invalid=true]": {
              color: "font.alert",
              bg: "background.alert",
              borderColor: "rgba(238, 241, 245, 0.54)",
            },
          },
        },
        defaultProps: {
          size: "md",
          variant: "blocto",
        },
      },
      Button: {
        variants: {
          primary: {
            width: "100%",
            height: "54px",
            py: "space.m",
            fontSize: "size.heading.5",
            fontWeight: "weight.l",
            lineHeight: "line.height.heading.4",
            bg: "interaction.primary",
            color: "font.inverse",
            borderRadius: "12px",
            _hover: {
              bg: { md: "interaction.primary.hovered" },
              transform: "scale(0.98)",
              _disabled: { bg: "interaction.primary.disabled" },
            },
            _active: {
              bg: "interaction.primary.pressed",
              transform: "scale(0.96)",
            },
            _disabled: {
              bg: "interaction.primary.disabled",
              cursor: "not-allowed",
            },
          },
        },
      },
    },
  })
);

export default theme;
