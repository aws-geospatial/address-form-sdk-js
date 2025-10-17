import clsx from "clsx";
import { Children, ComponentProps } from "react";
import * as styles from "./styles.css.ts";

export interface FlexProps extends ComponentProps<"div"> {
  direction: "row" | "column";
  gap?: number | string;
  flex?: boolean;
}

export function Flex({ direction, gap = "0.5rem", children, className, flex, ...rest }: FlexProps) {
  return (
    <div className={clsx(styles.root, className)} style={{ gap, flexDirection: direction }} {...rest}>
      {Children.map(children, (child) => (
        <div className={clsx(flex && styles.flex)}>{child}</div>
      ))}
    </div>
  );
}
