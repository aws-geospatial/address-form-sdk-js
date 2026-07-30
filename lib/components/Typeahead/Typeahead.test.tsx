import { GetPlaceCommandOutput } from "@aws-sdk/client-geo-places";
import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProvider } from "../../test/utils";
import * as api from "../../utils/api";
import { Typeahead } from "./index";
import { queryClient } from "../../utils/query-client";
import { useState } from "react";

vi.mock("../../utils/api", () => ({
  getPlace: vi.fn(),
  autocomplete: vi.fn(),
  suggest: vi.fn(),
  reverseGeocode: vi.fn(),
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
    // The query client is a module-level singleton with a 30-minute staleTime, so results cached
    // by one test would otherwise be served to the next instead of hitting the mocked API.
    queryClient.clear();
    vi.mocked(api.getPlace).mockResolvedValue(mockPlaceResult);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should render the combobox field", () => {
    renderWithProvider(<Typeahead apiName="autocomplete" {...mockProps} />);
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("should render the input field", () => {
    renderWithProvider(<Typeahead apiName={null} {...mockProps} />);
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("should fetch typeahead results when user types", async () => {
    let currentValue = "";
    const mockOnChange = vi.fn((newValue: string) => {
      currentValue = newValue;
    });
    const TestComponent = () => (
      <Typeahead apiName="autocomplete" value={currentValue} onChange={mockOnChange} onSelect={mockProps.onSelect} />
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
      <Typeahead apiName="autocomplete" value={currentValue} onChange={mockOnChange} onSelect={mockProps.onSelect} />
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
      <Typeahead apiName="autocomplete" value={currentValue} onChange={mockOnChange} onSelect={mockProps.onSelect} />
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
      <Typeahead apiName="autocomplete" value={currentValue} onChange={mockOnChange} onSelect={mockOnSelect} />
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
        placeId: "mock-place-id",
        addressLineOneField: "123 Mock St",
        addressLineTwoField: undefined,
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
      <Typeahead apiName="autocomplete" value={currentValue} onChange={mockOnChange} onSelect={mockProps.onSelect} />
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
    const TestComponent = () => {
      const [input, setInput] = useState("");

      return (
        <Typeahead
          apiName="autocomplete"
          apiInput={{ Language: "fr" }}
          value={input}
          onChange={setInput}
          onSelect={mockProps.onSelect}
        />
      );
    };

    const { getByRole } = renderWithProvider(<TestComponent />);

    act(() => {
      fireEvent.change(getByRole("combobox"), { target: { value: "123 Main St" } });
    });

    expect(api.autocomplete).toHaveBeenCalledWith(
      expect.any(Object), // client object
      expect.objectContaining({
        QueryText: "123 Main St",
        Language: "fr",
        MaxResults: 5,
      }),
    );
  });

  it("should pass biasPosition parameter to API calls", async () => {
    const biasPosition = [40.7128, -74.006];
    let currentValue = "";
    const mockOnChange = vi.fn((newValue: string) => {
      currentValue = newValue;
    });

    const TestComponent = () => (
      <Typeahead
        apiName="suggest"
        apiInput={{ BiasPosition: biasPosition }}
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
      <Typeahead apiName="autocomplete" value={currentValue} onChange={mockOnChange} onSelect={mockProps.onSelect} />
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

  it("should display full label for unsupported countries", async () => {
    let currentValue = "";
    const mockOnChange = vi.fn((newValue: string) => {
      currentValue = newValue;
    });
    const mockOnSelect = vi.fn();

    vi.mocked(api.autocomplete).mockResolvedValue({
      ResultItems: [
        {
          PlaceId: "test-place-id",
          Title: "Santa Croce, Sestiere Santa Croce, 1332A, 30135 Venezia VE, Italia",
          Address: { Label: "Santa Croce, Sestiere Santa Croce, 1332A, 30135 Venezia VE, Italia" },
          PlaceType: "Street",
        },
      ],
      PricingBucket: "bucket1",
      $metadata: {},
    });

    vi.mocked(api.getPlace).mockResolvedValue({
      Address: {
        Label: "Santa Croce, Sestiere Santa Croce, 1332A, 30135 Venezia VE, Italia",
        Country: { Code2: "IT", Name: "Italia" },
        Region: { Name: "Veneto" },
        Locality: "Venezia",
        PostalCode: "30135",
        AddressNumber: "1332A",
        Street: "Santa Croce",
      },
      Position: [12.32681, 45.44152],
      PlaceId: undefined,
      PlaceType: undefined,
      Title: undefined,
      PricingBucket: undefined,
      $metadata: {},
    });

    const TestComponent = () => (
      <Typeahead apiName="autocomplete" value={currentValue} onChange={mockOnChange} onSelect={mockOnSelect} />
    );

    const { rerender } = renderWithProvider(<TestComponent />);
    const input = screen.getByRole("combobox");

    fireEvent.change(input, { target: { value: "Santa Croce" } });
    currentValue = "Santa Croce";
    rerender(<TestComponent />);

    await waitFor(() => {
      expect(
        screen.getByText("Santa Croce, Sestiere Santa Croce, 1332A, 30135 Venezia VE, Italia"),
      ).toBeInTheDocument();
    });

    const option = screen.getByRole("option", {
      name: "Santa Croce, Sestiere Santa Croce, 1332A, 30135 Venezia VE, Italia",
    });
    await userEvent.click(option);

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith("Santa Croce, Sestiere Santa Croce, 1332A, 30135 Venezia VE, Italia");
      expect(mockOnSelect).toHaveBeenCalledWith({
        addressLineOneField: "Santa Croce, Sestiere Santa Croce, 1332A, 30135 Venezia VE, Italia",
        fullAddress: expect.objectContaining({
          Country: { Code2: "IT", Name: "Italia" },
        }),
        position: [12.32681, 45.44152],
      });
    });
  });

  it("should not make additional autocomplete calls after selecting an address from dropdown", async () => {
    let currentValue = "";
    const mockOnChange = vi.fn((newValue: string) => {
      currentValue = newValue;
    });
    const mockOnSelect = vi.fn();

    vi.mocked(api.autocomplete).mockResolvedValue({
      ResultItems: [
        {
          PlaceId: "place-1",
          Title: "123 Main St",
          Address: { Label: "123 Main St" },
          PlaceType: "Street",
        },
      ],
      PricingBucket: "bucket1",
      $metadata: {},
    });

    const TestComponent = () => (
      <Typeahead apiName="autocomplete" value={currentValue} onChange={mockOnChange} onSelect={mockOnSelect} />
    );

    const { rerender } = renderWithProvider(<TestComponent />);
    const input = screen.getByRole("combobox");

    // User types to trigger autocomplete
    fireEvent.change(input, { target: { value: "123 Main" } });
    currentValue = "123 Main";
    rerender(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByText("123 Main St")).toBeInTheDocument();
    });

    vi.mocked(api.autocomplete).mockClear();

    // User selects an address from dropdown
    const option = screen.getByRole("option", { name: "123 Main St" });
    await userEvent.click(option);

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalled();
    });

    currentValue = "123 Mock St";
    rerender(<TestComponent />);

    const DEBOUNCE_WAIT_MS = 100;
    await new Promise((resolve) => setTimeout(resolve, DEBOUNCE_WAIT_MS));

    // Verify no additional autocomplete calls after selection
    expect(api.autocomplete).not.toHaveBeenCalled();
  });

  it("should not make additional autocomplete calls after clicking locate button", async () => {
    let currentValue = "";
    const mockOnChange = vi.fn((newValue: string) => {
      currentValue = newValue;
    });
    const mockOnSelect = vi.fn();

    const mockGeolocation = {
      getCurrentPosition: vi.fn((success) => {
        success({
          coords: {
            latitude: 47.6062,
            longitude: -122.3321,
          },
        });
      }),
    };
    Object.defineProperty(global.navigator, "geolocation", {
      value: mockGeolocation,
      writable: true,
      configurable: true,
    });

    vi.mocked(api.reverseGeocode).mockResolvedValue({
      ResultItems: [
        {
          PlaceId: "current-location-place",
          Title: "Current Location Address",
          Address: { Label: "Current Location Address" },
          PlaceType: "Street",
        },
      ],
      PricingBucket: "bucket1",
      $metadata: {},
    });

    const TestComponent = () => (
      <Typeahead
        apiName="autocomplete"
        value={currentValue}
        onChange={mockOnChange}
        onSelect={mockOnSelect}
        showCurrentLocation={true}
      />
    );

    const { rerender } = renderWithProvider(<TestComponent />);

    vi.mocked(api.autocomplete).mockClear();

    // User clicks the locate button
    const locateButton = screen.getByTestId("aws-current-location");
    await userEvent.click(locateButton);

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalled();
    });

    const newAddress = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0];
    currentValue = newAddress;
    rerender(<TestComponent />);

    const DEBOUNCE_WAIT_MS = 100;
    await new Promise((resolve) => setTimeout(resolve, DEBOUNCE_WAIT_MS));

    // Verify no autocomplete calls after using locate button
    expect(api.autocomplete).not.toHaveBeenCalled();
  });

  it("should invalidate cache when BiasPosition changes", async () => {
    // `suggest` must resolve: an unmocked vi.fn() returns undefined, getSuggestResults throws on
    // `response.ResultItems`, and the query then sits in retry backoff. invalidateQueries cannot
    // start a second fetch while the first is still in flight, so the call count never reaches 2.
    vi.mocked(api.suggest).mockResolvedValue({
      ResultItems: [],
      PricingBucket: "mock-pricing-bucket",
      $metadata: {},
    });

    const TestComponent = ({ biasPosition }: { biasPosition?: [number, number] }) => {
      const [value, setValue] = useState("");

      return (
        <Typeahead
          apiName="suggest"
          value={value}
          onChange={setValue}
          onSelect={vi.fn()}
          apiInput={{ BiasPosition: biasPosition }}
        />
      );
    };

    const { rerender } = renderWithProvider(<TestComponent biasPosition={[0, 0]} />);
    const input = screen.getByRole("combobox");

    // Type initial query
    await act(async () => {
      fireEvent.change(input, { target: { value: "starbucks" } });
    });

    await waitFor(() => {
      expect(api.suggest).toHaveBeenCalledTimes(1);
    });

    // Change BiasPosition (map moved)
    await act(async () => {
      rerender(<TestComponent biasPosition={[-122.4, 37.8]} />);
    });

    // Type same query again
    await act(async () => {
      fireEvent.change(input, { target: { value: "" } });
      fireEvent.change(input, { target: { value: "starbucks" } });
    });

    await waitFor(() => {
      expect(api.suggest).toHaveBeenCalledTimes(2);
    });
  });

  it("should populate addressLineTwoField with POI name when PlaceType is PointOfInterest", async () => {
    let currentValue = "";
    const mockOnChange = vi.fn((newValue: string) => {
      currentValue = newValue;
    });
    const mockOnSelect = vi.fn();

    vi.mocked(api.autocomplete).mockResolvedValue({
      ResultItems: [
        {
          PlaceId: "poi-1",
          Title: "Starbucks Coffee",
          Address: { Label: "Starbucks Coffee, 123 Main St" },
          PlaceType: "PointOfInterest",
        },
      ],
      PricingBucket: "bucket1",
      $metadata: {},
    });

    const mockPoiResult: GetPlaceCommandOutput = {
      PlaceId: "poi-1",
      PlaceType: "PointOfInterest",
      Title: "Starbucks Coffee",
      PricingBucket: "mock-pricing-bucket",
      Address: { AddressNumber: "123", Street: "Main St", Label: "123 Main St" },
      Position: [-122.4, 37.8],
      $metadata: {},
    };

    vi.mocked(api.getPlace).mockResolvedValue(mockPoiResult);

    const TestComponent = () => (
      <Typeahead apiName="autocomplete" value={currentValue} onChange={mockOnChange} onSelect={mockOnSelect} />
    );

    const { rerender } = renderWithProvider(<TestComponent />);
    const input = screen.getByRole("combobox");

    fireEvent.change(input, { target: { value: "starbucks" } });
    currentValue = "starbucks";
    rerender(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByText("Starbucks Coffee, 123 Main St")).toBeInTheDocument();
    });

    const selectedOption = screen.getByRole("option", { name: "Starbucks Coffee, 123 Main St" });
    await userEvent.click(selectedOption);

    await waitFor(() => {
      expect(mockOnSelect).toHaveBeenCalledWith({
        placeId: "poi-1",
        addressLineOneField: "123 Main St",
        addressLineTwoField: "Starbucks Coffee",
        fullAddress: mockPoiResult.Address,
        position: [-122.4, 37.8],
      });
    });
  });
});
