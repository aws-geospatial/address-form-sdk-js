import type { JSX } from "react";

export type Config<TProps, TOptions = object> = TOptions & {
  props?: Partial<TProps>;
  component?: (props: TProps) => JSX.Element | null;
};
