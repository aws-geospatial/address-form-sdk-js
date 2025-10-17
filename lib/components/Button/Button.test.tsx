import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./index";

vi.mock("./styles.css.ts", () => ({
  stylePrimary: "primary-class",
  styleSecondary: "secondary-class",
}));

describe("Button Component", () => {
  it("renders the button with children content", () => {
    render(<Button onClick={() => {}}>Click Me</Button>);
    expect(screen.getByText("Click Me")).toBeInTheDocument();
  });

  it("calls the onClick handler when clicked", async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    await userEvent.click(screen.getByText("Click Me"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("applies primary class by default", () => {
    render(<Button onClick={() => {}}>Primary Button</Button>);
    const button = screen.getByText("Primary Button");
    expect(button.className).toContain("primary-class");
    expect(button.className).not.toContain("secondary-class");
  });

  it("applies secondary class when variant is secondary", () => {
    render(
      <Button onClick={() => {}} variant="secondary">
        Secondary Button
      </Button>,
    );
    const button = screen.getByText("Secondary Button");
    expect(button.className).toContain("secondary-class");
    expect(button.className).not.toContain("primary-class");
  });

  it("applies additional className when provided", () => {
    render(
      <Button onClick={() => {}} className="custom-class">
        Custom Button
      </Button>,
    );
    const button = screen.getByText("Custom Button");
    expect(button.className).toContain("custom-class");
  });

  it("sets disabled attribute when disabled prop is true", () => {
    render(
      <Button onClick={() => {}} disabled>
        Disabled Button
      </Button>,
    );
    const button = screen.getByText("Disabled Button");
    expect(button).toBeDisabled();
  });

  it("passes additional props to the button element", () => {
    render(
      <Button onClick={() => {}} data-testid="test-button" aria-label="Test Button">
        Props Button
      </Button>,
    );
    const button = screen.getByText("Props Button");
    expect(button).toHaveAttribute("data-testid", "test-button");
    expect(button).toHaveAttribute("aria-label", "Test Button");
  });
});
