import { PropsWithChildren } from "react";
import clsx from "clsx";
import { tooltipText, tooltipWrapper } from "./styles.css.ts";

interface TooltipProps {
  text: string;
  show?: boolean;
}

export function Tooltip({ text, show = true, children }: PropsWithChildren<TooltipProps>) {
  if (!show) return <>{children}</>;

  return (
    <span className={tooltipWrapper}>
      {children}
      <span className={clsx(tooltipText, "aws-tooltip")} role="tooltip">
        {text}
      </span>
    </span>
  );
}
