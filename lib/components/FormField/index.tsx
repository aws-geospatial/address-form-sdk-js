import { base } from "./styles.css.ts";

export interface FormFieldProps {
  id: string;
  label: string;
  children: React.ReactNode;
  className?: string;
}

export function FormField({ id, label, children, className = "" }: FormFieldProps) {
  return (
    <div className={`${base} ${className || ""}`}>
      <label htmlFor={id}>{label}</label>
      {children}
    </div>
  );
}
