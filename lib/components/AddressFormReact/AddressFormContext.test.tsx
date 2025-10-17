import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { useContext } from "react";
import { AddressFormContext, AddressFormContextType } from "./AddressFormContext";

describe("AddressFormContext", () => {
  it("provides undefined by default", () => {
    let contextValue: AddressFormContextType | undefined;

    const TestComponent = () => {
      contextValue = useContext(AddressFormContext);
      return null;
    };

    render(<TestComponent />);
    expect(contextValue).toBeUndefined();
  });

  it("provides context value when wrapped", () => {
    const mockValue: AddressFormContextType = {
      apiKey: "test-key",
      region: "us-east-1",
      data: { city: "Seattle" },
      setData: vi.fn(),
      setMapViewState: vi.fn(),
    };

    let contextValue: AddressFormContextType | undefined;

    const TestComponent = () => {
      contextValue = useContext(AddressFormContext);
      return null;
    };

    render(
      <AddressFormContext.Provider value={mockValue}>
        <TestComponent />
      </AddressFormContext.Provider>,
    );

    expect(contextValue).toEqual(mockValue);
  });
});
