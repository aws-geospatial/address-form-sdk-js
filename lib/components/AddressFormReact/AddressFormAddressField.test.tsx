import { ReverseGeocodeCommandOutput } from "@aws-sdk/client-geo-places";
import { fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithProvider } from "../../test/utils";
import * as api from "../../utils/api";
import { AddressFormAddressField } from "./AddressFormAddressField";
import { AddressFormContext, AddressFormContextType } from "./AddressFormContext";
import { useNotificationStore } from "../../stores/notificationStore";

// Mock the autocomplete, getPlace, and reverseGeocode functions
vi.mock("../../utils/api", () => ({
  autocomplete: vi.fn(),
  suggest: vi.fn(),
  getPlace: vi.fn(),
  reverseGeocode: vi.fn(),
}));

const mockSetData = vi.fn();
const mockSetMapViewState = vi.fn();

const mockContextValue: AddressFormContextType = {
  apiKey: "test-key",
  region: "us-east-1",
  data: { addressLineOne: "123 Main St", country: "US" },
  setData: mockSetData,
  setMapViewState: mockSetMapViewState,
  isAutofill: false,
  setIsAutofill: vi.fn(),
  typeaheadApiName: "autocomplete",
  setTypeaheadApiName: vi.fn(),
};

describe("AddressFormAddressField", () => {
  it("renders with context value", () => {
    renderWithProvider(
      <AddressFormContext.Provider value={mockContextValue}>
        <AddressFormAddressField
          name="addressLineOne"
          label="Address"
          showCurrentLocation={false}
          apiName="autocomplete"
        />
      </AddressFormContext.Provider>,
    );

    expect(document.querySelector("label")).toHaveTextContent("Address");
    expect(document.querySelector("input")).toHaveValue("123 Main St");
  });

  it("applies placeholder prop", () => {
    renderWithProvider(
      <AddressFormContext.Provider value={mockContextValue}>
        <AddressFormAddressField
          name="addressLineOne"
          label="Address"
          showCurrentLocation={false}
          apiName="autocomplete"
          placeholder="Enter address"
        />
      </AddressFormContext.Provider>,
    );

    const input = document.querySelector("input")!;
    expect(input).toHaveAttribute("placeholder", "Enter address");
  });

  it("calls setData on change", () => {
    renderWithProvider(
      <AddressFormContext.Provider value={mockContextValue}>
        <AddressFormAddressField
          name="addressLineOne"
          label="Address"
          showCurrentLocation={false}
          apiName="autocomplete"
        />
      </AddressFormContext.Provider>,
    );

    const input = document.querySelector("input")!;
    fireEvent.change(input, { target: { value: "456 Oak Ave" } });
    expect(mockSetData).toHaveBeenCalledWith({ addressLineOne: "456 Oak Ave" });
  });

  it("handles empty context data", () => {
    const emptyContext = { ...mockContextValue, data: {} };
    renderWithProvider(
      <AddressFormContext.Provider value={emptyContext}>
        <AddressFormAddressField
          name="addressLineOne"
          label="Address"
          showCurrentLocation={false}
          apiName="autocomplete"
        />
      </AddressFormContext.Provider>,
    );

    const input = document.querySelector("input");
    expect(input).toHaveValue("");
  });

  it("accepts string apiName values", () => {
    renderWithProvider(
      <AddressFormContext.Provider value={mockContextValue}>
        <AddressFormAddressField name="addressLineOne" label="Address" showCurrentLocation={false} apiName="suggest" />
      </AddressFormContext.Provider>,
    );

    expect(document.querySelector("input")).toBeInTheDocument();
  });

  it("treats empty string apiName as null", () => {
    renderWithProvider(
      <AddressFormContext.Provider value={mockContextValue}>
        <AddressFormAddressField name="addressLineOne" label="Address" showCurrentLocation={false} apiName="" />
      </AddressFormContext.Provider>,
    );

    expect(document.querySelector("input")).toBeInTheDocument();
  });

  it("throws error for invalid apiName", () => {
    expect(() => {
      renderWithProvider(
        <AddressFormContext.Provider value={mockContextValue}>
          <AddressFormAddressField
            name="addressLineOne"
            label="Address"
            showCurrentLocation={false}
            apiName="invalid"
          />
        </AddressFormContext.Provider>,
      );
    }).toThrow('Invalid apiName: "invalid". Must be "autocomplete", "suggest", or null.');
  });

  it("updates context with addressDetails when typeahead result is selected", async () => {
    vi.clearAllMocks();

    // Create a real data state to capture updates
    let contextData = { addressLineOne: "test" };

    const mockSetData = vi.fn((updater) => {
      if (typeof updater === "function") {
        contextData = { ...contextData, ...updater(contextData) };
      } else {
        contextData = { ...contextData, ...updater };
      }
    });

    const mockContextValueWithRealUpdater = {
      ...mockContextValue,
      data: contextData,
      setData: mockSetData,
    };

    const mockAutocompleteResponse = {
      ResultItems: [
        {
          PlaceId: "test-place-id",
          Title: "510 W Georgia St, Vancouver, BC",
          Address: {
            Label: "510 W Georgia St, Vancouver, BC",
          },
          PlaceType: undefined,
        },
      ],
      PricingBucket: undefined,
      $metadata: {},
    };

    vi.mocked(api.autocomplete).mockResolvedValue(mockAutocompleteResponse);

    // Mock getPlace response
    const mockGetPlaceResponse = {
      Address: {
        Label: "510 W Georgia St, Vancouver, BC",
        Country: { Code2: "CA", Name: "Canada" },
        Region: { Name: "BC" },
        Locality: "Vancouver",
        PostalCode: "V6B 1Z6",
        AddressNumber: "510",
        Street: "W Georgia St",
      },
      Position: [-123.1207, 49.2827],
      PlaceId: undefined,
      PlaceType: undefined,
      Title: undefined,
      PricingBucket: undefined,
      $metadata: {},
    };
    vi.mocked(api.getPlace).mockResolvedValue(mockGetPlaceResponse);

    const { getByLabelText, getByRole } = renderWithProvider(
      <AddressFormContext.Provider value={mockContextValueWithRealUpdater}>
        <AddressFormAddressField
          name="addressLineOne"
          label="Address"
          showCurrentLocation={false}
          apiName="autocomplete"
        />
      </AddressFormContext.Provider>,
    );

    const input = getByLabelText("Address");

    // Type something to trigger API call
    await userEvent.clear(input);
    await userEvent.type(input, "510 W Georgia");

    // Wait for autocomplete to be called (with debounce)
    await waitFor(() => {
      expect(api.autocomplete).toHaveBeenCalled();
    });

    // Wait for and click the first option
    const firstOption = await waitFor(() => getByRole("option", { name: /510 W Georgia St, Vancouver, BC/ }));
    await userEvent.click(firstOption);

    // Verify getPlace was called with the correct PlaceId
    await waitFor(() => {
      expect(api.getPlace).toHaveBeenCalledWith(
        expect.any(Object), // client
        expect.objectContaining({ PlaceId: "test-place-id" }),
      );
    });

    // Verify context was updated with address data including addressDetails
    await waitFor(() => {
      expect(mockSetData).toHaveBeenCalledWith(
        expect.objectContaining({
          addressLineOne: "510 W Georgia St",
          city: "Vancouver",
          postalCode: "V6B 1Z6",
          province: "BC",
          country: "CA",
          originalPosition: "-123.1207,49.2827",
          addressDetails: mockGetPlaceResponse.Address,
        }),
      );
    });
  });

  it("warns instead of filling the field when the device is outside centerBounds", async () => {
    vi.clearAllMocks();
    useNotificationStore.getState().clearNotifications();

    const mockGeolocation = {
      getCurrentPosition: vi.fn(),
      watchPosition: vi.fn(),
      clearWatch: vi.fn(),
    };
    Object.defineProperty(global.navigator, "geolocation", { value: mockGeolocation, configurable: true });
    // Device far outside the region (Vancouver).
    mockGeolocation.getCurrentPosition.mockImplementation((success) => {
      success({ coords: { latitude: 49.2827, longitude: -123.1207 } });
    });

    const contextValue: AddressFormContextType = {
      ...mockContextValue,
      data: {},
      centerBounds: [
        [103.6, 1.2],
        [104.1, 1.5],
      ],
    };

    const { getByRole } = renderWithProvider(
      <AddressFormContext.Provider value={contextValue}>
        <AddressFormAddressField name="addressLineOne" label="Address" showCurrentLocation={true} apiName="suggest" />
      </AddressFormContext.Provider>,
    );

    await userEvent.click(getByRole("button"));

    await waitFor(() => {
      expect(useNotificationStore.getState().notifications).toEqual([
        expect.objectContaining({ type: "warning", message: "Your current location is outside the supported region" }),
      ]);
    });
    // No lookup, and nothing written back to the form — the old behavior clamped to the
    // Singapore box corner and filled the field with an address in another country.
    expect(api.reverseGeocode).not.toHaveBeenCalled();
    expect(mockSetData).not.toHaveBeenCalled();
  });

  it("updates context with addressDetails when locate button is clicked", async () => {
    vi.clearAllMocks();

    // Mock geolocation
    const mockGeolocation = {
      getCurrentPosition: vi.fn(),
      watchPosition: vi.fn(),
      clearWatch: vi.fn(),
    };
    Object.defineProperty(global.navigator, "geolocation", {
      value: mockGeolocation,
      configurable: true,
    });

    // Create a real data state to capture updates
    let contextData = { addressLineOne: "" };

    const mockSetData = vi.fn((updater) => {
      if (typeof updater === "function") {
        contextData = { ...contextData, ...updater(contextData) };
      } else {
        contextData = { ...contextData, ...updater };
      }
    });

    const mockContextValueWithRealUpdater = {
      ...mockContextValue,
      data: contextData,
      setData: mockSetData,
    };

    // Mock reverseGeocode response
    const mockReverseGeocodeResponse = {
      ResultItems: [
        {
          Address: {
            Label: "510 W Georgia St, Vancouver, BC",
            Country: { Code2: "CA", Name: "Canada" },
            Region: { Name: "BC" },
            Locality: "Vancouver",
            PostalCode: "V6B 1Z6",
            AddressNumber: "510",
            Street: "W Georgia St",
          },
          Position: [-123.1207, 49.2827],
        },
      ],
    };
    vi.mocked(api.reverseGeocode).mockResolvedValue(mockReverseGeocodeResponse as ReverseGeocodeCommandOutput);

    // Mock getCurrentPosition to return coordinates
    mockGeolocation.getCurrentPosition.mockImplementation((success) => {
      success({
        coords: {
          latitude: 49.2827,
          longitude: -123.1207,
        },
      });
    });

    const { getByRole } = renderWithProvider(
      <AddressFormContext.Provider value={mockContextValueWithRealUpdater}>
        <AddressFormAddressField
          name="addressLineOne"
          label="Address"
          showCurrentLocation={true}
          apiName="autocomplete"
        />
      </AddressFormContext.Provider>,
    );

    // Click the locate button
    const locateButton = getByRole("button");
    await userEvent.click(locateButton);

    // Verify getCurrentPosition was called
    await waitFor(() => {
      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
    });

    // Verify reverseGeocode was called with correct coordinates
    await waitFor(() => {
      expect(api.reverseGeocode).toHaveBeenCalledWith(
        expect.any(Object), // client
        expect.objectContaining({ QueryPosition: [-123.1207, 49.2827] }),
      );
    });

    // Verify context was updated with address data including addressDetails
    await waitFor(() => {
      expect(mockSetData).toHaveBeenCalledWith(
        expect.objectContaining({
          addressLineOne: "510 W Georgia St",
          city: "Vancouver",
          postalCode: "V6B 1Z6",
          province: "BC",
          country: "CA",
          originalPosition: "-123.1207,49.2827",
          addressDetails: mockReverseGeocodeResponse.ResultItems[0].Address,
        }),
      );
    });
  });
});
