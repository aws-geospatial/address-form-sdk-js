import { style } from "@vanilla-extract/css";

export const base = style({
  display: "flex",
  flexDirection: "row",
  gap: "2rem",
});

export const reversed = style({
  flexDirection: "row-reverse",
});

export const form = style({
  flex: 1,
});

export const map = style({
  flex: 1,
  aspectRatio: "1/1",
});

export const formElements = style({
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
});

export const formButtons = style({
  display: "flex",
  flexDirection: "row",
  gap: "0.5rem",
});
