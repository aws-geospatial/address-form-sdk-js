import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { AddressForm } from "./AddressForm";
import { AddressFormContext, AddressFormContextType } from "./AddressFormContext";
import { useContext } from "react";

const mockContextValue: AddressFormContextType = {
  apiKey: "test-key",
  region: "us-east-1",
  data: {},
  setData: vi.fn(),
  setMapViewState: vi.fn(),
};

const renderWithContext = (ui: React.ReactElement) => {
  return render(<AddressFormContext.Provider value={mockContextValue}>{ui}</AddressFormContext.Provider>);
};

describe("AddressForm", () => {
  it("renders form element", () => {
    renderWithContext(<AddressForm apiKey="test" region="us-east-1" />);
    expect(document.querySelector("form")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    renderWithContext(<AddressForm apiKey="test" region="us-east-1" className="custom" />);
    expect(document.querySelector("form")).toHaveClass("custom");
  });

  it("renders child components", () => {
    renderWithContext(
      <AddressForm apiKey="test" region="us-east-1">
        <input address-form="aws-city" />
        <button address-form="submit" />
      </AddressForm>,
    );
    expect(document.querySelector("input")).toBeInTheDocument();
    expect(document.querySelector("button")).toBeInTheDocument();
  });

  it("provides context value", () => {
    const TestComponent = () => {
      const context = useContext(AddressFormContext);
      return <div data-testid="context">{context?.apiKey}</div>;
    };

    renderWithContext(
      <AddressForm apiKey="test-key" region="us-west-2">
        <TestComponent />
      </AddressForm>,
    );
    expect(document.querySelector('[data-testid="context"]')).toHaveTextContent("test-key");
  });
});
