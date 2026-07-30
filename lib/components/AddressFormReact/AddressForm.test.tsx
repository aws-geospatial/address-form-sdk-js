import { fireEvent, waitFor, screen, act } from "@testing-library/react";
import { useContext, useEffect } from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderWithProvider } from "../../test/utils";
import { AddressForm } from "./AddressForm";
import { AddressFormContext, AddressFormContextType, useAddressFormContext } from "./AddressFormContext";
import { GeoPlacesClient, GetPlaceIntendedUse } from "@aws-sdk/client-geo-places";
import * as api from "../../utils/api";
import { useNotificationStore } from "../../stores/notificationStore";

vi.mock("../../utils/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../utils/api")>();
  return { ...actual, getPlace: vi.fn() };
});

const mockContextValue: AddressFormContextType = {
  apiKey: "test-key",
  region: "us-east-1",
  data: {},
  setData: vi.fn(),
  setMapViewState: vi.fn(),
  isAutofill: false,
  setIsAutofill: vi.fn(),
  typeaheadApiName: "autocomplete",
  setTypeaheadApiName: vi.fn(),
};

const renderWithContext = (ui: React.ReactElement) => {
  return renderWithProvider(<AddressFormContext.Provider value={mockContextValue}>{ui}</AddressFormContext.Provider>);
};

describe("AddressForm", () => {
  beforeEach(() => {
    useNotificationStore.getState().clearNotifications();
  });

  it("renders form element", () => {
    renderWithContext(
      <AddressForm apiKey="test" region="us-east-1">
        <div />
      </AddressForm>,
    );
    expect(document.querySelector("form")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    renderWithContext(
      <AddressForm apiKey="test" region="us-east-1" className="custom">
        <div />
      </AddressForm>,
    );
    expect(document.querySelector("form")).toHaveClass("custom");
  });

  it("renders child components", () => {
    renderWithContext(
      <AddressForm apiKey="test" region="us-east-1">
        <input data-type="address-form" name="city" />
        <button data-type="address-form" type="submit" />
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

  it("resets form data when Reset button is clicked", () => {
    const { getByLabelText, getByRole } = renderWithProvider(
      <AddressForm apiKey="test" region="us-east-1">
        <input data-type="address-form" name="addressLineTwo" />
        <input data-type="address-form" name="city" />
        <input data-type="address-form" name="province" />
        <input data-type="address-form" name="postalCode" />
        <button data-type="address-form" type="reset">
          Reset
        </button>
      </AddressForm>,
    );

    const addressLineTwo = getByLabelText("Address Line 2");
    const city = getByLabelText("City");
    const province = getByLabelText("Province/State");
    const postalCode = getByLabelText("Postal/Zip code");
    const resetButton = getByRole("button", { name: "Reset" });

    // Populate all form fields with data
    fireEvent.change(addressLineTwo, { target: { value: "Apartment 456" } });
    fireEvent.change(city, { target: { value: "Vancouver" } });
    fireEvent.change(province, { target: { value: "BC" } });
    fireEvent.change(postalCode, { target: { value: "V6B 1Z6" } });

    // Verify all fields have data
    expect(addressLineTwo).toHaveValue("Apartment 456");
    expect(city).toHaveValue("Vancouver");
    expect(province).toHaveValue("BC");
    expect(postalCode).toHaveValue("V6B 1Z6");

    // Click reset button
    fireEvent.click(resetButton);

    // Verify all fields are cleared
    expect(addressLineTwo).toHaveValue("");
    expect(city).toHaveValue("");
    expect(province).toHaveValue("");
    expect(postalCode).toHaveValue("");
  });

  it("calls getPlace with STORAGE intendedUse when getData is called with STORAGE", async () => {
    const mockOnSubmit = vi.fn();

    const TestForm = () => {
      const { setData } = useAddressFormContext();

      useEffect(() => {
        setData({ placeId: "test-place-id" });
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);

      return (
        <button data-type="address-form" type="submit">
          Submit
        </button>
      );
    };

    const { getByRole } = renderWithProvider(
      <AddressForm apiKey="test" region="us-east-1" onSubmit={mockOnSubmit}>
        <TestForm />
      </AddressForm>,
    );

    fireEvent.click(getByRole("button", { name: "Submit" }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });

    const getData = mockOnSubmit.mock.calls[0][0];
    const data = await getData({ intendedUse: GetPlaceIntendedUse.STORAGE });

    expect(data).toEqual({ placeId: "test-place-id" });
    expect(api.getPlace).toHaveBeenCalledWith(expect.any(GeoPlacesClient), {
      PlaceId: "test-place-id",
      IntendedUse: GetPlaceIntendedUse.STORAGE,
    });
  });

  it("does not call getPlace when getData is called without STORAGE intendedUse", async () => {
    vi.clearAllMocks();
    const mockOnSubmit = vi.fn();

    const TestForm = () => {
      const { setData } = useAddressFormContext();

      useEffect(() => {
        setData({ placeId: "test-place-id" });
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);

      return (
        <button data-type="address-form" type="submit">
          Submit
        </button>
      );
    };

    const { getByRole } = renderWithProvider(
      <AddressForm apiKey="test" region="us-east-1" onSubmit={mockOnSubmit}>
        <TestForm />
      </AddressForm>,
    );

    fireEvent.click(getByRole("button", { name: "Submit" }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });

    const getData = mockOnSubmit.mock.calls[0][0];
    const data = await getData({ intendedUse: GetPlaceIntendedUse.SINGLE_USE });

    expect(data).toEqual({ placeId: "test-place-id" });
    expect(api.getPlace).not.toHaveBeenCalled();
  });

  it("displays notification message when added to store", async () => {
    renderWithProvider(
      <AddressForm apiKey="test" region="us-east-1">
        <div />
      </AddressForm>,
    );

    act(() => {
      useNotificationStore.getState().addNotification({
        message: "Test notification message",
        type: "error",
      });
    });

    await waitFor(() => {
      expect(screen.getByText("Test notification message")).toBeInTheDocument();
    });
  });

  const grabBounds: [[number, number], [number, number]] = [
    [103.6, 1.2],
    [104.1, 1.5],
  ];

  // Seeds an adjustedPosition (as if the user dragged the pin) so the submit-guard tests can
  // drive isAdjustedPositionOutOfBounds without a live map.
  const AdjustedPositionSeeder = ({ position }: { position: string }) => {
    const { setData } = useAddressFormContext();
    useEffect(() => {
      setData({ adjustedPosition: position });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return null;
  };

  it("blocks submit when the adjusted pin is outside centerBounds", async () => {
    const mockOnSubmit = vi.fn();
    const { getByRole } = renderWithProvider(
      <AddressForm
        apiKey="test"
        region="ap-southeast-1"
        onSubmit={mockOnSubmit}
        centerBounds={grabBounds}
        initialMapCenter={[103.85, 1.35]}
      >
        <AdjustedPositionSeeder position="120,20" />
        <button data-type="address-form" type="submit">
          Submit
        </button>
      </AddressForm>,
    );

    const button = getByRole("button", { name: "Submit" });
    await waitFor(() => expect(button).toBeDisabled());

    // Dispatch on the form rather than clicking: the disabled button already swallows the click,
    // so a click alone would pass even with the handler's guard removed. Enter-to-submit and
    // programmatic requestSubmit() reach the handler directly, and this is that path.
    fireEvent.submit(button.closest("form")!);

    // Give any async submit a chance to run, then assert it never fired.
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("allows submit when the adjusted pin is inside centerBounds", async () => {
    const mockOnSubmit = vi.fn();
    const { getByRole } = renderWithProvider(
      <AddressForm
        apiKey="test"
        region="ap-southeast-1"
        onSubmit={mockOnSubmit}
        centerBounds={grabBounds}
        initialMapCenter={[103.85, 1.35]}
      >
        <AdjustedPositionSeeder position="103.9,1.4" />
        <button data-type="address-form" type="submit">
          Submit
        </button>
      </AddressForm>,
    );

    fireEvent.click(getByRole("button", { name: "Submit" }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  it("allows submit when there is no adjusted pin even if the initial center is out of region", async () => {
    const mockOnSubmit = vi.fn();
    const { getByRole } = renderWithProvider(
      <AddressForm
        apiKey="test"
        region="ap-southeast-1"
        onSubmit={mockOnSubmit}
        centerBounds={grabBounds}
        initialMapCenter={[120, 20]}
      >
        <button data-type="address-form" type="submit">
          Submit
        </button>
      </AddressForm>,
    );

    fireEvent.click(getByRole("button", { name: "Submit" }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  it("disables the composable submit button when the adjusted pin is outside centerBounds", async () => {
    const { getByRole } = renderWithProvider(
      <AddressForm apiKey="test" region="ap-southeast-1" centerBounds={grabBounds} initialMapCenter={[103.85, 1.35]}>
        <AdjustedPositionSeeder position="120,20" />
        <button data-type="address-form" type="submit">
          Submit
        </button>
      </AddressForm>,
    );

    await waitFor(() => {
      expect(getByRole("button", { name: "Submit" })).toBeDisabled();
    });
  });

  it("keeps the composable submit button enabled when the adjusted pin is inside centerBounds", () => {
    const { getByRole } = renderWithProvider(
      <AddressForm apiKey="test" region="ap-southeast-1" centerBounds={grabBounds} initialMapCenter={[103.85, 1.35]}>
        <AdjustedPositionSeeder position="103.9,1.4" />
        <button data-type="address-form" type="submit">
          Submit
        </button>
      </AddressForm>,
    );

    expect(getByRole("button", { name: "Submit" })).toBeEnabled();
  });
});
