import type { ReactElement, ReactNode } from "react";
import { Children, cloneElement, isValidElement } from "react";

type ReplacementRule = {
  search: ReactElement;
  replace: (props: Record<string, unknown>) => ReactElement;
};

export const replaceChildElements = (children: ReactNode, rules: ReplacementRule[]): ReactNode => {
  const replace = (child: ReactNode): ReactNode => {
    if (isValidElement(child)) {
      const props = child.props as Record<string, unknown>;

      for (const rule of rules) {
        const searchProps = rule.search.props as Record<string, unknown>;

        if (child.type === rule.search.type) {
          const matches = Object.entries(searchProps).every(([key, value]) => props[key] === value);

          if (matches) {
            const restProps = { ...props };
            Object.keys(searchProps).forEach((key) => delete restProps[key]);
            return rule.replace(restProps);
          }
        }
      }

      if (props.children) {
        return cloneElement(child as ReactElement<Record<string, unknown>>, {
          children: Children.map(props.children as ReactNode, replace),
        });
      }
    }

    return child;
  };

  return Children.map(children, replace);
};
