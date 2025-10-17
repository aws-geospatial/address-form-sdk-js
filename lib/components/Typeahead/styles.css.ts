import { style } from "@vanilla-extract/css";

export const base = style({
  position: "relative",
});

export const input = style({
  width: "100%",
  paddingRight: "2rem",
  boxSizing: "border-box",
});

export const option = style({
  padding: "0.5rem 0.75rem",

  selectors: {
    '&[data-headlessui-state~="active"]': {
      cursor: "pointer",
      backgroundColor: "#eaeaea",
    },
  },
});

export const info = style({
  padding: "0.5rem 0.75rem",
  fontSize: "0.75rem",
  fontWeight: "bold",
});

export const options = style({
  width: "calc(var(--input-width) - 1px)",
  border: "0.1px solid black",
  backgroundColor: "white",
  zIndex: 999,
  maxHeight: "250px !important",
});

export const currentLocation = style({
  position: "absolute",
  right: "0.5rem",
  top: "0.55rem",
});
