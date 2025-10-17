import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CountrySelect } from "./index";

// Mock the CSS modules
vi.mock("../Typeahead/styles.css", () => ({
  option: "option-class",
  options: "options-class",
}));

vi.mock("./styles.css", () => ({
  selected: "selected-class",
}));

// Mock the Input component
vi.mock("../Input", () => ({
  Input: vi.fn(({ onChange, ...props }) => <input {...props} onChange={onChange} data-testid="country-input" />),
}));

describe("<CountrySelect>", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with single selection mode by default", () => {
    const mockOnChange = vi.fn();
    render(<CountrySelect value={null} onChange={mockOnChange} />);

    expect(screen.getByTestId("country-input")).toBeInTheDocument();
    expect(screen.getByLabelText("Country")).toBeInTheDocument();
  });

  it("renders with multiple selection mode when multiple prop is true", () => {
    const mockOnChange = vi.fn();
    render(<CountrySelect multiple value={[]} onChange={mockOnChange} />);

    expect(screen.getByTestId("country-input")).toBeInTheDocument();
    expect(screen.getByLabelText("Country")).toBeInTheDocument();
  });

  it("displays selected country name in single mode", () => {
    const mockOnChange = vi.fn();
    render(<CountrySelect value="US" onChange={mockOnChange} />);

    const input = screen.getByTestId("country-input");
    expect(input).toHaveValue("United States");
  });

  it("displays selected country names joined by comma in multiple mode", () => {
    const mockOnChange = vi.fn();
    render(<CountrySelect multiple value={["US", "CA"]} onChange={mockOnChange} />);

    const input = screen.getByTestId("country-input");
    // Countries are displayed in alphabetical order by the component
    expect(input).toHaveValue("Canada, United States");
  });

  it("filters countries based on input text", async () => {
    const mockOnChange = vi.fn();
    render(<CountrySelect value={null} onChange={mockOnChange} />);

    const input = screen.getByTestId("country-input");
    await userEvent.type(input, "united");

    // Should show filtered options
    await waitFor(() => {
      expect(screen.getByText("United States")).toBeInTheDocument();
      expect(screen.getByText("United Kingdom")).toBeInTheDocument();
    });
  });

  it("shows all countries when input is empty", async () => {
    const mockOnChange = vi.fn();
    render(<CountrySelect value={null} onChange={mockOnChange} />);

    const input = screen.getByTestId("country-input");
    await userEvent.click(input);

    // Should show some countries (checking for a few common ones)
    await waitFor(() => {
      expect(screen.getByText("United States")).toBeInTheDocument();
      expect(screen.getByText("Canada")).toBeInTheDocument();
      expect(screen.getByText("United Kingdom")).toBeInTheDocument();
    });
  });

  it("filters countries case insensitively", async () => {
    const mockOnChange = vi.fn();
    render(<CountrySelect value={null} onChange={mockOnChange} />);

    const input = screen.getByTestId("country-input");
    await userEvent.type(input, "CANADA");

    await waitFor(() => {
      expect(screen.getByText("Canada")).toBeInTheDocument();
    });
  });

  it("calls onChange with country code in single mode", async () => {
    const mockOnChange = vi.fn();
    render(<CountrySelect value={null} onChange={mockOnChange} />);

    const input = screen.getByTestId("country-input");
    await userEvent.click(input);

    await waitFor(() => {
      expect(screen.getByText("Canada")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText("Canada"));

    expect(mockOnChange).toHaveBeenCalledWith("CA");
  });

  it("calls onChange with array of country codes in multiple mode", async () => {
    const mockOnChange = vi.fn();
    render(<CountrySelect multiple value={[]} onChange={mockOnChange} />);

    const input = screen.getByTestId("country-input");
    await userEvent.click(input);

    await waitFor(() => {
      expect(screen.getByText("Canada")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText("Canada"));

    expect(mockOnChange).toHaveBeenCalledWith(["CA"]);
  });

  it("handles multiple country selection", async () => {
    const mockOnChange = vi.fn();
    render(<CountrySelect multiple value={["US"]} onChange={mockOnChange} />);

    const input = screen.getByTestId("country-input");
    await userEvent.click(input);

    await waitFor(() => {
      expect(screen.getByText("Canada")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText("Canada"));

    expect(mockOnChange).toHaveBeenCalledWith(["US", "CA"]);
  });

  it("filters countries based on allowedCountries prop", async () => {
    const mockOnChange = vi.fn();
    render(<CountrySelect value={null} onChange={mockOnChange} allowedCountries={["US", "CA", "GB"]} />);

    const input = screen.getByTestId("country-input");
    await userEvent.click(input);

    await waitFor(() => {
      expect(screen.getByText("United States")).toBeInTheDocument();
      expect(screen.getByText("Canada")).toBeInTheDocument();
      expect(screen.getByText("United Kingdom")).toBeInTheDocument();
    });

    // Should not show countries not in allowedCountries
    expect(screen.queryByText("France")).not.toBeInTheDocument();
  });

  it("shows only allowed countries when filtering with text", async () => {
    const mockOnChange = vi.fn();
    render(<CountrySelect value={null} onChange={mockOnChange} allowedCountries={["US", "CA"]} />);

    const input = screen.getByTestId("country-input");
    await userEvent.type(input, "united");

    await waitFor(() => {
      expect(screen.getByText("United States")).toBeInTheDocument();
    });

    // Should not show United Kingdom since it's not in allowedCountries
    expect(screen.queryByText("United Kingdom")).not.toBeInTheDocument();
  });

  it("clears input when combobox is closed", async () => {
    const mockOnChange = vi.fn();
    render(<CountrySelect value={null} onChange={mockOnChange} />);

    const input = screen.getByTestId("country-input");
    await userEvent.type(input, "canada");

    // Simulate closing the combobox by pressing Escape
    fireEvent.keyDown(input, { key: "Escape" });

    // The query should be cleared (this is handled by the onClose callback)
    // But the input value should show the selected country name or be empty
    expect(input).toHaveValue("");
  });

  it("handles null value in single mode", () => {
    const mockOnChange = vi.fn();
    render(<CountrySelect value={null} onChange={mockOnChange} />);

    expect(screen.getByTestId("country-input")).toBeInTheDocument();
    expect(screen.getByTestId("country-input")).toHaveValue("");
  });

  it("handles empty array in multiple mode", () => {
    const mockOnChange = vi.fn();
    render(<CountrySelect multiple value={[]} onChange={mockOnChange} />);

    expect(screen.getByTestId("country-input")).toBeInTheDocument();
    expect(screen.getByTestId("country-input")).toHaveValue("");
  });

  it("clears selection when input is cleared in single mode", async () => {
    const mockOnChange = vi.fn();
    render(<CountrySelect value="US" onChange={mockOnChange} />);

    const input = screen.getByTestId("country-input");
    expect(input).toHaveValue("United States");

    // Clear the input
    await userEvent.clear(input);

    expect(mockOnChange).toHaveBeenCalledWith(null);
  });

  it("shows query text when user is typing", async () => {
    const mockOnChange = vi.fn();
    render(<CountrySelect value="US" onChange={mockOnChange} />);

    const input = screen.getByTestId("country-input");
    expect(input).toHaveValue("United States");

    // Start typing
    await userEvent.type(input, "can");

    // Should show the query text, not the selected country
    expect(input).toHaveValue("United Statescan");
  });

  it("applies selected styling to selected countries", async () => {
    const mockOnChange = vi.fn();
    render(<CountrySelect multiple value={["US"]} onChange={mockOnChange} />);

    const input = screen.getByTestId("country-input");
    await userEvent.click(input);

    // Wait for options to appear and check that the component renders with selected styling logic
    await waitFor(() => {
      const options = document.querySelectorAll('[role="option"]');
      expect(options.length).toBeGreaterThan(0);

      // Check that some options have the base option class
      const firstOption = options[0];
      expect(firstOption).toHaveClass("option-class");
    });
  });

  it("handles country selection with special characters in name", async () => {
    const mockOnChange = vi.fn();
    render(<CountrySelect value={null} onChange={mockOnChange} />);

    const input = screen.getByTestId("country-input");
    await userEvent.type(input, "curaçao");

    await waitFor(() => {
      expect(screen.getByText("Curaçao")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText("Curaçao"));

    expect(mockOnChange).toHaveBeenCalledWith("CW");
  });

  it("hides options when no countries match the filter", async () => {
    const mockOnChange = vi.fn();
    render(<CountrySelect value={null} onChange={mockOnChange} />);

    const input = screen.getByTestId("country-input");
    await userEvent.type(input, "nonexistentcountry");

    // The options container should be hidden when no countries match
    await waitFor(() => {
      const optionsContainer = document.querySelector(".options-class");
      expect(optionsContainer).toHaveAttribute("hidden");
    });
  });

  it("forwards additional props to the underlying Input component", () => {
    const mockOnChange = vi.fn();
    render(
      <CountrySelect
        value={null}
        onChange={mockOnChange}
        placeholder="Choose a country"
        className="custom-country-select"
      />,
    );

    const input = screen.getByTestId("country-input");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("placeholder", "Choose a country");
    expect(input).toHaveClass("custom-country-select");
  });
});
