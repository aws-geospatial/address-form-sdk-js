import { describe, it, expect } from "vitest";
import { ReactElement, ReactNode } from "react";
import { replaceChildElements } from "./replace-child-elements";

describe("replaceChildElements", () => {
  it("replaces matching elements", () => {
    const children = <div id="test">content</div>;
    const rules = [
      {
        search: <div id="test" />,
        replace: (props: Record<string, unknown>) => <span {...props}>replaced</span>,
      },
    ];

    const result = replaceChildElements(children, rules) as ReactElement[];

    expect(Array.isArray(result)).toBe(true);
    expect(result[0].type).toBe("span");
    expect((result[0].props as { children: ReactNode }).children).toBe("replaced");
  });

  it("returns original children when no rules match", () => {
    const children = <div id="other">content</div>;
    const rules = [
      {
        search: <div id="test" />,
        replace: () => <span>replaced</span>,
      },
    ];

    const result = replaceChildElements(children, rules) as ReactElement[];

    expect(Array.isArray(result)).toBe(true);
    expect(result[0].type).toBe("div");
    expect((result[0].props as { id: string }).id).toBe("other");
  });
});
