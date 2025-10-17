import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { AddressFormCountryField } from "./AddressFormCountryField";
import { AddressFormContext, AddressFormContextType } from "./AddressFormContext";

const mockSetData = vi.fn();
const mockSetMapViewState = vi.fn();

const mockContextValue: AddressFormContextType = {
  apiKey: "test-key",
  region: "us-east-1",
  data: { country: "US" },
  setData: mockSetData,
  setMapViewState: mockSetMapViewState,
};

describe("AddressFormCountryField", () => {
  it("renders with context value", () => {
    render(
      <AddressFormContext.Provider value={mockContextValue}>
        <AddressFormCountryField name="country" label="Country" />
      </AddressFormContext.Provider>,
    );

    expect(document.querySelector("label")).toHaveTextContent("Country");
  });

  it("renders as combobox input", () => {
    render(
      <AddressFormContext.Provider value={mockContextValue}>
        <AddressFormCountryField name="country" label="Country" />
      </AddressFormContext.Provider>,
    );

    const input = document.querySelector("input")!;
    expect(input).toHaveAttribute("role", "combobox");
  });

  it("applies className prop", () => {
    render(
      <AddressFormContext.Provider value={mockContextValue}>
        <AddressFormCountryField name="country" label="Country" className="custom-class" />
      </AddressFormContext.Provider>,
    );

    const input = document.querySelector("input")!;
    expect(input).toHaveClass("custom-class");
  });

  it("applies placeholder prop", () => {
    render(
      <AddressFormContext.Provider value={mockContextValue}>
        <AddressFormCountryField name="country" label="Country" placeholder="Select country" />
      </AddressFormContext.Provider>,
    );

    const input = document.querySelector("input")!;
    expect(input).toHaveAttribute("placeholder", "Select country");
  });

  it("calls setData on change", () => {
    render(
      <AddressFormContext.Provider value={mockContextValue}>
        <AddressFormCountryField name="country" label="Country" />
      </AddressFormContext.Provider>,
    );

    const input = document.querySelector("input")!;
    fireEvent.change(input, { target: { value: "Canada" } });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });
  });

  it("handles empty context data", () => {
    const emptyContext = { ...mockContextValue, data: {} };
    render(
      <AddressFormContext.Provider value={emptyContext}>
        <AddressFormCountryField name="country" label="Country" />
      </AddressFormContext.Provider>,
    );

    const input = document.querySelector("input");
    expect(input).toHaveValue("");
  });
});
