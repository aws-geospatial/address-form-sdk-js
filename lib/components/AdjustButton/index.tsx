import { FunctionComponent } from "react";
import { Button, ButtonProps } from "../Button";
import { root } from "./styles.css";
import clsx from "clsx";

export const AdjustButton: FunctionComponent<Omit<ButtonProps, "variant">> = ({ className, ...props }) => {
  return <Button variant="primary" className={clsx(root, className)} {...props} />;
};
