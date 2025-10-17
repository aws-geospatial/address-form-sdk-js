import { GetPlaceCommandOutput } from "@aws-sdk/client-geo-places";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProvider } from "../../test/utils";
import * as api from "../../utils/api";
import { Typeahead } from "./index";

vi.mock("../../utils/api", () => ({
  getPlace: vi.fn(),
  autocomplete: vi.fn(),
  suggest: vi.fn(),
}));

vi.mock("../../utils/debounce", () => ({
  useDebounce: (value: string) => value,
}));

describe("Typeahead Component", () => {
  const mockProps = {
    value: "",
    onChange: vi.fn(),
    onSelect: vi.fn(),
  };

  const mockPlaceResult: GetPlaceCommandOutput = {
    PlaceId: "mock-place-id",
    PlaceType: "InterpolatedAddress",
    Title: "mock-title",
    PricingBucket: "mock-pricing-bucket",
    Address: { AddressNumber: "123", Street: "Mock St", Label: "123 Mock St" },
    Position: [0, 0],
    $metadata: {},
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.getPlace).mockResolvedValue(mockPlaceResult);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should render the combobox field", () => {
    renderWithProvider(<Typeahead source="autocomplete" {...mockProps} />);
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("should render the input field", () => {
    renderWithProvider(<Typeahead source={null} {...mockProps} />);
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("should fetch typeahead results when user types", async () => {
    let currentValue = "";
    const mockOnChange = vi.fn((newValue: string) => {
      currentValue = newValue;
    });
    const TestComponent = () => (
      <Typeahead source="autocomplete" value={currentValue} onChange={mockOnChange} onSelect={mockProps.onSelect} />
    );
    const { rerender } = renderWithProvider(<TestComponent />);

    // Simulate typing by changing the value directly
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "test address" } });
    currentValue = "test address";
    rerender(<TestComponent />);

    // Wait for the API call to be made
    await waitFor(() => {
      expect(api.autocomplete).toHaveBeenCalledWith(
        expect.any(Object), // client object
        expect.objectContaining({ QueryText: "test address", MaxResults: 5 }),
      );
    });
  });

  it("should display typeahead results", async () => {
    let currentValue = "";
    const mockOnChange = vi.fn((newValue: string) => {
      currentValue = newValue;
    });

    // Mock the API to return results
    vi.mocked(api.autocomplete).mockResolvedValue({
      ResultItems: [
        {
          PlaceId: "place-1",
          Title: "Address 1",
          Address: { Label: "Address 1" },
          PlaceType: "Street",
        },
        {
          PlaceId: "place-2",
          Title: "Address 2",
          Address: { Label: "Address 2" },
          PlaceType: "Street",
        },
      ],
      PricingBucket: "bucket1",
      $metadata: {},
    });

    const TestComponent = () => (
      <Typeahead source="autocomplete" value={currentValue} onChange={mockOnChange} onSelect={mockProps.onSelect} />
    );

    const { rerender } = renderWithProvider(<TestComponent />);
    const input = screen.getByRole("combobox");

    fireEvent.change(input, { target: { value: "test address" } });
    currentValue = "test address";
    rerender(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByText("Address 1")).toBeInTheDocument();
      expect(screen.getByText("Address 2")).toBeInTheDocument();
    });
  });

  it("should call onChange when text is inputted", async () => {
    let currentValue = "";
    const mockOnChange = vi.fn((newValue: string) => {
      currentValue = newValue;
    });

    const TestComponent = () => (
      <Typeahead source="autocomplete" value={currentValue} onChange={mockOnChange} onSelect={mockProps.onSelect} />
    );

    renderWithProvider(<TestComponent />);
    const input = screen.getByRole("combobox");

    fireEvent.change(input, { target: { value: "test address" } });

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith("test address");
    });
  });

  it("should call onChange when an address is selected", async () => {
    let currentValue = "";
    const mockOnChange = vi.fn((newValue: string) => {
      currentValue = newValue;
    });
    const mockOnSelect = vi.fn();

    // Mock the API to return results
    vi.mocked(api.autocomplete).mockResolvedValue({
      ResultItems: [
        {
          PlaceId: "place-1",
          Title: "Address 1",
          Address: { Label: "Address 1" },
          PlaceType: "Street",
        },
      ],
      PricingBucket: "bucket1",
      $metadata: {},
    });

    const TestComponent = () => (
      <Typeahead source="autocomplete" value={currentValue} onChange={mockOnChange} onSelect={mockOnSelect} />
    );

    const { rerender } = renderWithProvider(<TestComponent />);
    const input = screen.getByRole("combobox");

    fireEvent.change(input, { target: { value: "test address" } });
    currentValue = "test address";
    rerender(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByText("Address 1")).toBeInTheDocument();
    });

    const selectedOption = await screen.getByRole("option", {
      name: "Address 1",
    });
    await userEvent.selectOptions(screen.getByRole("listbox"), selectedOption);

    await waitFor(() => {
      expect(api.getPlace).toHaveBeenCalledWith(
        expect.any(Object), // client object
        {
          PlaceId: "place-1",
          Language: undefined,
          PoliticalView: undefined,
        },
      );
      expect(mockOnSelect).toHaveBeenCalledWith({
        addressLineOneField: "123 Mock St",
        fullAddress: {
          AddressNumber: "123",
          Street: "Mock St",
          Label: "123 Mock St",
        },
        position: [0, 0],
      });
    });
  });

  it("should clear results when input is empty", async () => {
    let currentValue = "";
    const mockOnChange = vi.fn((newValue: string) => {
      currentValue = newValue;
    });

    // Mock the API to return results
    vi.mocked(api.autocomplete).mockResolvedValue({
      ResultItems: [
        {
          PlaceId: "place-1",
          Title: "Address 1",
          Address: { Label: "Address 1" },
          PlaceType: "Street",
        },
      ],
      PricingBucket: "bucket1",
      $metadata: {},
    });

    const TestComponent = () => (
      <Typeahead source="autocomplete" value={currentValue} onChange={mockOnChange} onSelect={mockProps.onSelect} />
    );

    const { rerender } = renderWithProvider(<TestComponent />);
    const input = screen.getByRole("combobox");

    fireEvent.change(input, { target: { value: "test address" } });
    currentValue = "test address";
    rerender(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByText("Address 1")).toBeInTheDocument();
    });

    fireEvent.change(input, { target: { value: "" } });
    currentValue = "";
    rerender(<TestComponent />);

    await waitFor(() => {
      expect(screen.queryByText("Address 1")).not.toBeInTheDocument();
    });
  });

  it("should pass language parameter to API calls", async () => {
    let currentValue = "";
    const mockOnChange = vi.fn((newValue: string) => {
      currentValue = newValue;
    });

    const TestComponent = () => (
      <Typeahead
        source="autocomplete"
        sourceInput={{ Language: "fr" }}
        value={currentValue}
        onChange={mockOnChange}
        onSelect={mockProps.onSelect}
      />
    );

    const { rerender } = renderWithProvider(<TestComponent />);
    const input = screen.getByRole("combobox");

    fireEvent.change(input, { target: { value: "test address" } });
    currentValue = "test address";
    rerender(<TestComponent />);

    await waitFor(() => {
      expect(api.autocomplete).toHaveBeenCalledWith(
        expect.any(Object), // client object
        expect.objectContaining({
          QueryText: "test address",
          Language: "fr",
          MaxResults: 5,
        }),
      );
    });
  });

  it("should pass biasPosition parameter to API calls", async () => {
    const biasPosition = [40.7128, -74.006];
    let currentValue = "";
    const mockOnChange = vi.fn((newValue: string) => {
      currentValue = newValue;
    });

    const TestComponent = () => (
      <Typeahead
        source="suggest"
        sourceInput={{ BiasPosition: biasPosition }}
        value={currentValue}
        onChange={mockOnChange}
        onSelect={mockProps.onSelect}
      />
    );

    const { rerender } = renderWithProvider(<TestComponent />);
    const input = screen.getByRole("combobox");

    fireEvent.change(input, { target: { value: "test address" } });
    currentValue = "test address";
    rerender(<TestComponent />);

    await waitFor(() => {
      expect(api.suggest).toHaveBeenCalledWith(
        expect.any(Object), // client object
        expect.objectContaining({
          QueryText: "test address",
          BiasPosition: biasPosition,
          MaxResults: 5,
        }),
      );
    });
  });

  it("should clear results when Combobox is closed", async () => {
    let currentValue = "";
    const mockOnChange = vi.fn((newValue: string) => {
      currentValue = newValue;
    });

    // Mock the API to return results
    vi.mocked(api.autocomplete).mockResolvedValue({
      ResultItems: [
        {
          PlaceId: "place-1",
          Title: "Address 1",
          Address: { Label: "Address 1" },
          PlaceType: "Street",
        },
      ],
      PricingBucket: "bucket1",
      $metadata: {},
    });

    const TestComponent = () => (
      <Typeahead source="autocomplete" value={currentValue} onChange={mockOnChange} onSelect={mockProps.onSelect} />
    );

    const { rerender } = renderWithProvider(<TestComponent />);
    const input = screen.getByRole("combobox");

    fireEvent.change(input, { target: { value: "test address" } });
    currentValue = "test address";
    rerender(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByText("Address 1")).toBeInTheDocument();
    });

    // Simulate closing the combobox
    fireEvent.blur(input);
    // Trigger the onClose callback
    const combobox = input.closest('[role="combobox"]');
    if (combobox) {
      fireEvent.keyDown(combobox, { key: "Escape", code: "Escape" });
    }

    await waitFor(() => {
      expect(screen.queryByText("Address 1")).not.toBeInTheDocument();
    });
  });
});
