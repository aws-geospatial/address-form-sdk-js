import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Tooltip } from "./index";

describe("Tooltip Component", () => {
  it("renders tooltip text when show is true", () => {
    render(
      <Tooltip text="Test tooltip">
        <button>Hover me</button>
      </Tooltip>,
    );
    expect(screen.getByRole("tooltip")).toHaveTextContent("Test tooltip");
  });

  it("does not render tooltip wrapper when show is false", () => {
    render(
      <Tooltip text="Test tooltip" show={false}>
        <button>Hover me</button>
      </Tooltip>,
    );
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("renders children regardless of show prop", () => {
    const { rerender } = render(
      <Tooltip text="Test tooltip" show={true}>
        <button>Hover me</button>
      </Tooltip>,
    );
    expect(screen.getByRole("button")).toBeInTheDocument();

    rerender(
      <Tooltip text="Test tooltip" show={false}>
        <button>Hover me</button>
      </Tooltip>,
    );
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("applies aws-tooltip class for customer overrides", () => {
    render(
      <Tooltip text="Test tooltip">
        <button>Hover me</button>
      </Tooltip>,
    );
    expect(screen.getByRole("tooltip").className).toContain("aws-tooltip");
  });
});
