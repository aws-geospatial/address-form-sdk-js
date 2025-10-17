import { style } from "@vanilla-extract/css";

export const styleAdjustMarker = style({
  position: "absolute",
  top: "0.5rem",
  marginLeft: "0.5rem",
});

export const styleAdjustButtons = style({
  display: "flex",
  gap: "0.5rem",
});

export const styleButton = style({
  boxShadow: "0 0 2px 2px rgba(0,0,0,0.1)",
});
