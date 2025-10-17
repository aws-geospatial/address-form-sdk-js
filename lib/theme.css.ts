import { createGlobalTheme, globalStyle } from "@vanilla-extract/css";

globalStyle("html, body, button, input, label", {
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  WebkitFontSmoothing: "antialiased",
  MozOsxFontSmoothing: "grayscale",
});

export const theme = createGlobalTheme(":root", {
  color: {
    primary: "#18181B",
    secondary: "#ECECEC",
    white: "#FFFFFF",
    black: "#000000",
  },
  padding: {
    button: {
      small: "0.5rem 0.75rem",
      medium: "0.75rem 1rem",
      large: "1rem 1.25rem",
    },
    input: {
      small: "0.5rem 0.75rem",
      medium: "0.75rem 1rem",
      large: "1rem 1.25rem",
    },
  },
  borderRadius: {
    small: "0.25rem",
    medium: "0.375rem",
    large: "0.5rem",
  },
});
