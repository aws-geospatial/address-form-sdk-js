import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Flex } from "./index";

vi.mock("./styles.css.ts", () => ({
  root: "stack-class",
}));

describe("Stack Component", () => {
  it("renders children with stack class", () => {
    render(
      <Flex direction="row">
        <div>Item 1</div>
        <div>Item 2</div>
      </Flex>,
    );

    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
  });

  it("applies gap style", () => {
    const { container } = render(
      <Flex direction="row" gap={16}>
        <div>Item</div>
      </Flex>,
    );

    expect(container.firstChild).toHaveStyle("gap: 16px");
  });

  it("has vertical flex direction", () => {
    const { container } = render(
      <Flex direction="row">
        <div>Item</div>
      </Flex>,
    );

    const stack = container.firstChild as HTMLElement;
    expect(stack.className).toContain("stack-class");
  });
});
