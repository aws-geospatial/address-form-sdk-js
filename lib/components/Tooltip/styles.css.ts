import { style } from "@vanilla-extract/css";
import { theme } from "../../theme.css";

export const tooltipWrapper = style({});

export const tooltipText = style({
  zIndex: 1,
  visibility: "hidden",
  position: "absolute",
  bottom: "calc(100% + 6px)",
  transform: "translateX(-50%)",
  backgroundColor: theme.color.primary,
  color: theme.color.white,
  padding: "0.5rem 0.75rem",
  borderRadius: theme.borderRadius.small,
  fontSize: "0.75rem",
  whiteSpace: "nowrap",
  pointerEvents: "none",
  selectors: {
    [`${tooltipWrapper}:hover &`]: {
      visibility: "visible",
    },
  },
});
