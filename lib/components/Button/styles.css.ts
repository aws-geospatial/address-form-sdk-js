import { style } from "@vanilla-extract/css";
import { theme } from "../../theme.css";

const styleBase = style({
  padding: theme.padding.button.medium,
  borderRadius: theme.borderRadius.medium,
  cursor: "pointer",
  transition: "background-color 0.1s ease",
  border: "none",
  selectors: {
    "&:disabled": {
      opacity: 0.5,
      cursor: "not-allowed",
    },
  },
});

export const stylePrimary = style([
  styleBase,
  {
    color: theme.color.white,
    backgroundColor: theme.color.primary,
    selectors: {
      "&:hover": {
        backgroundColor: "#606060",
      },
    },
  },
]);

export const styleSecondary = style([
  styleBase,
  {
    color: theme.color.black,
    backgroundColor: theme.color.secondary,
    selectors: {
      "&:hover": {
        backgroundColor: "#E1E1E1",
      },
    },
  },
]);

export const styleSmall = style({
  padding: theme.padding.button.small,
  borderRadius: theme.borderRadius.small,
});

export const styleLarge = style({
  padding: theme.padding.button.large,
  borderRadius: theme.borderRadius.large,
});
