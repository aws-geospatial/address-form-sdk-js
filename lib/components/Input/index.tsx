import { base } from "./styles.css.ts";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  disabled?: boolean;
  placeholder?: string;
}

export function Input({ className = "", placeholder = "", disabled, ...restProps }: InputProps) {
  return (
    <input className={`${base} ${className || ""}`} disabled={disabled} placeholder={placeholder} {...restProps} />
  );
}
