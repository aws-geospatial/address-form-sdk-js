import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { FormField } from "./index";

vi.mock("./styles.css.ts", () => ({
  base: "base-class",
}));

describe("FormField Component", () => {
  it("renders the FormField", () => {
    const { container } = render(
      <FormField id="test-id" label="Test Label">
        <input id="test-id" data-testid="test-input" />
      </FormField>,
    );
    expect(screen.getByText("Test Label")).toBeInTheDocument();
    expect(screen.getByText("Test Label")).toHaveAttribute("for", "test-id");
    expect(container.firstChild).toHaveClass("base-class");
    expect(screen.getByTestId("test-input")).toBeInTheDocument();
  });

  it("associates label with input using htmlFor", () => {
    render(
      <FormField id="test-id" label="Test Label">
        <input data-testid="test-input" />
      </FormField>,
    );
    const label = screen.getByText("Test Label");
    expect(label).toHaveAttribute("for", "test-id");
  });

  it("applies additional className when provided", () => {
    const { container } = render(
      <FormField id="test-id" label="Test Label" className="custom-class">
        <input />
      </FormField>,
    );
    expect(container.firstChild).toHaveClass("base-class");
    expect(container.firstChild).toHaveClass("custom-class");
  });
});
