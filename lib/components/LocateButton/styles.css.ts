import { style } from "@vanilla-extract/css";
import { theme } from "../../theme.css";

export const styleButton = style({
  cursor: "pointer",
  background: "none",
  border: "none",
  color: theme.color.primary,
  selectors: {
    "&:hover": {
      color: "#606060",
    },
    "&:disabled": {
      color: theme.color.primary,
      opacity: 0.2,
      cursor: "not-allowed",
    },
  },
});
