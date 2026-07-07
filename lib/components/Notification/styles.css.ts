import { style, styleVariants } from "@vanilla-extract/css";
import { theme } from "../../theme.css";

const notificationBase = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0.5rem 0.75rem",
  borderRadius: "0.25rem",
  marginBottom: "0.5rem",
  boxShadow: "0 2px 3px rgba(0, 0, 0, 0.15)",
});

export const notificationVariants = styleVariants({
  error: [notificationBase, { backgroundColor: "#fee", border: "1px solid #fcc" }],
  warning: [notificationBase, { backgroundColor: "#fff8e1", border: "1px solid #ffe082" }],
});

export const messageVariants = styleVariants({
  error: { flex: 1, color: theme.color.black, fontSize: "0.8rem" },
  warning: { flex: 1, color: theme.color.black, fontSize: "0.8rem" },
});

export const closeButtonVariants = styleVariants({
  error: {
    background: "none",
    border: "none",
    color: theme.color.black,
    fontSize: "1rem",
    cursor: "pointer",
    padding: "0.2rem",
    lineHeight: 1,
    selectors: { "&:hover": { opacity: 0.75 } },
  },
  warning: {
    background: "none",
    border: "none",
    color: theme.color.black,
    fontSize: "1rem",
    cursor: "pointer",
    padding: "0.2rem",
    lineHeight: 1,
    selectors: { "&:hover": { opacity: 0.75 } },
  },
});
