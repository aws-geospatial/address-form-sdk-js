import { style } from "@vanilla-extract/css";

export const pinContainer = style({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -100%)",
  pointerEvents: "none",
  zIndex: 1,
});

export const adjustmentMessageContainer = style({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  height: "2.75rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.5rem",
  backgroundColor: "rgba(236, 236, 236, 0.95)",
  zIndex: 1,
  fontSize: "0.8rem",
});
