import { fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithProvider } from "../../test/utils";
import { AddressFormAddressField } from "./AddressFormAddressField";
import { AddressFormContext, AddressFormContextType } from "./AddressFormContext";

const mockSetData = vi.fn();
const mockSetMapViewState = vi.fn();

const mockContextValue: AddressFormContextType = {
  apiKey: "test-key",
  region: "us-east-1",
  data: { addressLineOne: "123 Main St", country: "US" },
  setData: mockSetData,
  setMapViewState: mockSetMapViewState,
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
});
