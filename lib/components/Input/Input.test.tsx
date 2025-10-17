import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "./index";

vi.mock("./styles.css.ts", () => ({
  base: "base-class",
}));

describe("Input Component", () => {
  it("renders the input element", () => {
    render(<Input data-testid="test-input" />);
    expect(screen.getByTestId("test-input")).toBeInTheDocument();
  });

  it("applies base class by default", () => {
    render(<Input data-testid="test-input" />);
    const input = screen.getByTestId("test-input");
    expect(input.className).toContain("base-class");
  });

  it("applies additional className when provided", () => {
    render(<Input data-testid="test-input" className="custom-class" />);
    const input = screen.getByTestId("test-input");
    expect(input.className).toContain("base-class");
    expect(input.className).toContain("custom-class");
  });

  it("sets disabled attribute when disabled prop is true", () => {
    render(<Input data-testid="test-input" disabled />);
    const input = screen.getByTestId("test-input");
    expect(input).toBeDisabled();
  });

  it("displays the placeholder text", () => {
    const placeholderText = "Enter your name";
    render(<Input placeholder={placeholderText} />);
    expect(screen.getByPlaceholderText(placeholderText)).toBeInTheDocument();
  });

  it("passes additional props to the input element", () => {
    render(<Input data-testid="test-input" aria-label="Test Input" name="test-name" type="email" />);
    const input = screen.getByTestId("test-input");
    expect(input).toHaveAttribute("aria-label", "Test Input");
    expect(input).toHaveAttribute("name", "test-name");
    expect(input).toHaveAttribute("type", "email");
  });

  it("handles user input correctly", async () => {
    const handleChange = vi.fn();
    render(<Input data-testid="test-input" onChange={handleChange} />);
    const input = screen.getByTestId("test-input");
    await userEvent.type(input, "Hello");
    expect(handleChange).toHaveBeenCalledTimes(5);
    expect(input).toHaveValue("Hello");
  });
});
