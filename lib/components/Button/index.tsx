import { stylePrimary, styleSecondary, styleSmall, styleLarge } from "./styles.css.ts";
import { Button as HeadlessButton } from "@headlessui/react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  variant?: "primary" | "secondary";
  disabled?: boolean;
  size?: "small" | "medium" | "large";
}

export function Button({
  children,
  className = "",
  variant = "primary",
  size = "medium",
  disabled,
  ...restProps
}: ButtonProps) {
  const sizeStyle = size === "small" ? styleSmall : size === "large" ? styleLarge : "";

  return (
    <HeadlessButton
      className={`${variant === "primary" ? stylePrimary : styleSecondary} ${sizeStyle} ${className || ""}`}
      disabled={disabled}
      {...restProps}
    >
      {children}
    </HeadlessButton>
  );
}
