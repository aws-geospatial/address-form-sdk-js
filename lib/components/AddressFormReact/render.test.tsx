import { describe, it, expect, beforeEach, vi } from "vitest";
import { fireEvent, act, waitFor, screen } from "@testing-library/react";
import { render } from "./render";
import { useAddressFormContext } from "./AddressFormContext";
import { useNotificationStore } from "../../stores/notificationStore";

// Replace the real (MapLibre) map with a stub that lets a test drive the shared
// adjustedPosition — the only input that flips isAdjustedPositionOutOfBounds — the way the
// real map's pan handler would.
vi.mock("./AddressFormMap", () => ({
  AddressFormMap: () => {
    const { setData } = useAddressFormContext();
    return (
      <div data-testid="mock-map">
        <button type="button" onClick={() => setData({ adjustedPosition: "120,20" })}>
          seed-out-of-bounds
        </button>
        <button type="button" onClick={() => setData({ adjustedPosition: "103.9,1.4" })}>
          seed-in-bounds
        </button>
      </div>
    );
  },
}));

describe("render", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    useNotificationStore.getState().clearNotifications();
  });

  it("should throw error when form is not found", () => {
    expect(() => {
      render({
        root: "#non-existent-form",
        apiKey: "test-key",
        region: "us-east-1",
      });
    }).toThrow('Address form could not be initialized. No form element found matching selector "#non-existent-form"');
  });

  it("should not throw error when form exists", () => {
    document.body.innerHTML = '<form id="test-form"></form>';

    expect(() => {
      act(() => {
        render({
          root: "#test-form",
          apiKey: "test-key",
          region: "us-east-1",
        });
      });
    }).not.toThrow();
  });

  it("should render complete form with all field types", () => {
    document.body.innerHTML = `
      <form id="address-form">
        <input data-type="address-form" name="addressLineOne" />
        <input data-type="address-form" name="addressLineTwo" />
        <input data-type="address-form" name="city" />
        <input data-type="address-form" name="province" />
        <input data-type="address-form" name="postalCode" />
        <input data-type="address-form" name="country" />
        <button data-type="address-form" type="submit">Submit</button>
        <button data-type="address-form" type="reset">Reset</button>
      </form>
    `;

    act(() => {
      render({
        root: "#address-form",
        apiKey: "test-key",
        region: "us-east-1",
      });
    });

    // Verify form still exists (not replaced)
    expect(document.querySelector("#address-form")).toBeInTheDocument();
  });

  it("should render React components with labels and placeholders", async () => {
    document.body.innerHTML = `
      <form id="address-form">
        <input data-type="address-form" name="addressLineOne" />
        <input data-type="address-form" name="addressLineTwo" />
        <input data-type="address-form" name="city" />
      </form>
    `;

    act(() => {
      render({
        root: "#address-form",
        apiKey: "test-key",
        region: "us-east-1",
      });
    });

    // Wait for React components to render using waitFor
    await waitFor(() => {
      expect(document.body.textContent).toContain("Address");
    });

    // Verify React components are rendered with labels
    expect(document.body.textContent).toContain("Address Line 2");
    expect(document.body.textContent).toContain("City");

    // Verify placeholders exist in rendered inputs
    expect(document.querySelector('input[placeholder="Enter address"]')).toBeInTheDocument();
    expect(document.querySelector('input[placeholder="Apartment, suite, etc."]')).toBeInTheDocument();
  });

  it("should replace original DOM nodes with React components", async () => {
    document.body.innerHTML = `
      <form id="address-form">
        <input data-type="address-form" name="addressLineOne" />
        <input data-type="address-form" name="addressLineTwo" />
        <input data-type="address-form" name="city" />
        <input data-type="address-form" name="province" />
        <input data-type="address-form" name="postalCode" />
        <input data-type="address-form" name="country" />
        <button data-type="address-form" type="submit">Submit</button>
        <button data-type="address-form" type="reset">Reset</button>
      </form>
    `;

    // Capture references to original DOM nodes
    const originalNodes = {
      addressLineOne: document.querySelector('input[name="addressLineOne"]'),
      addressLineTwo: document.querySelector('input[name="addressLineTwo"]'),
      city: document.querySelector('input[name="city"]'),
      province: document.querySelector('input[name="province"]'),
      postalCode: document.querySelector('input[name="postalCode"]'),
      country: document.querySelector('input[name="country"]'),
      submitButton: document.querySelector('button[type="submit"]'),
      resetButton: document.querySelector('button[type="reset"]'),
    };

    act(() => {
      render({
        root: "#address-form",
        apiKey: "test-key",
        region: "us-east-1",
      });
    });

    // Wait for React components to replace the first DOM node
    await waitFor(() => {
      const newElement = document.querySelector('input[name="addressLineOne"]');
      expect(newElement).toBeInTheDocument();
      expect(newElement).not.toBe(originalNodes.addressLineOne);
    });

    // Verify all original input nodes have been replaced
    expect(document.querySelector('input[name="addressLineOne"]')).not.toBe(originalNodes.addressLineOne);
    expect(document.querySelector('input[name="addressLineTwo"]')).not.toBe(originalNodes.addressLineTwo);
    expect(document.querySelector('input[name="city"]')).not.toBe(originalNodes.city);
    expect(document.querySelector('input[name="province"]')).not.toBe(originalNodes.province);
    expect(document.querySelector('input[name="postalCode"]')).not.toBe(originalNodes.postalCode);
    expect(document.querySelector('input[name="country"]')).not.toBe(originalNodes.country);

    // Verify buttons are also replaced
    expect(document.querySelector('button[type="submit"]')).not.toBe(originalNodes.submitButton);
    expect(document.querySelector('button[type="reset"]')).not.toBe(originalNodes.resetButton);

    // Verify new elements still exist with same selectors
    expect(document.querySelector('input[name="addressLineOne"]')).toBeInTheDocument();
    expect(document.querySelector('input[name="addressLineTwo"]')).toBeInTheDocument();
    expect(document.querySelector('input[name="city"]')).toBeInTheDocument();
    expect(document.querySelector('input[name="province"]')).toBeInTheDocument();
    expect(document.querySelector('input[name="postalCode"]')).toBeInTheDocument();
    expect(document.querySelector('input[name="country"]')).toBeInTheDocument();
  });

  it("resets form data when Reset button is clicked", async () => {
    document.body.innerHTML = `
      <form id="address-form">
        <input data-type="address-form" name="addressLineOne" />
        <input data-type="address-form" name="addressLineTwo" />
        <input data-type="address-form" name="city" />
        <input data-type="address-form" name="province" />
        <input data-type="address-form" name="postalCode" />
        <button data-type="address-form" type="reset">Reset</button>
      </form>
    `;

    act(() => {
      render({
        root: "#address-form",
        apiKey: "test-key",
        region: "us-east-1",
      });
    });

    // Wait for React components to render
    await waitFor(() => {
      expect(document.querySelector('input[name="addressLineTwo"]')).toBeInTheDocument();
    });

    const addressLineTwo = document.querySelector('input[name="addressLineTwo"]') as HTMLInputElement;
    const city = document.querySelector('input[name="city"]') as HTMLInputElement;
    const province = document.querySelector('input[name="province"]') as HTMLInputElement;
    const postalCode = document.querySelector('input[name="postalCode"]') as HTMLInputElement;
    const resetButton = document.querySelector('button[type="reset"]') as HTMLButtonElement;

    // Populate all form fields with data
    act(() => {
      fireEvent.change(addressLineTwo, { target: { value: "Apartment 456" } });
      fireEvent.change(city, { target: { value: "Vancouver" } });
      fireEvent.change(province, { target: { value: "BC" } });
      fireEvent.change(postalCode, { target: { value: "V6B 1Z6" } });
    });

    // Verify all fields have data
    expect(addressLineTwo.value).toBe("Apartment 456");
    expect(city.value).toBe("Vancouver");
    expect(province.value).toBe("BC");
    expect(postalCode.value).toBe("V6B 1Z6");

    // Click reset button
    act(() => {
      fireEvent.click(resetButton);
    });

    // Verify all fields are cleared
    expect(addressLineTwo.value).toBe("");
    expect(city.value).toBe("");
    expect(province.value).toBe("");
    expect(postalCode.value).toBe("");
  });

  it("displays notification message when added to store", async () => {
    document.body.innerHTML = '<form id="test-form"></form>';

    act(() => {
      render({
        root: "#test-form",
        apiKey: "test-key",
        region: "us-east-1",
      });
    });

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

  it("disables the submit button when the adjusted pin is dragged outside centerBounds", async () => {
    document.body.innerHTML = `
      <form id="address-form">
        <div data-type="address-form" data-map-style="Standard,Light"></div>
        <button data-type="address-form" type="submit">Submit</button>
      </form>
    `;

    act(() => {
      render({
        root: "#address-form",
        apiKey: "test-key",
        region: "ap-southeast-1",
        centerBounds: grabBounds,
        initialMapCenter: [103.85, 1.35],
      });
    });

    // Starts enabled (no adjustment yet), then disables once the pin lands out of region.
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Submit" })).toBeEnabled();
    });
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: "seed-out-of-bounds" }));
    });
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Submit" })).toBeDisabled();
    });
  });

  it("keeps the submit button enabled when the adjusted pin stays inside centerBounds", async () => {
    document.body.innerHTML = `
      <form id="address-form">
        <div data-type="address-form" data-map-style="Standard,Light"></div>
        <button data-type="address-form" type="submit">Submit</button>
      </form>
    `;

    act(() => {
      render({
        root: "#address-form",
        apiKey: "test-key",
        region: "ap-southeast-1",
        centerBounds: grabBounds,
        initialMapCenter: [103.85, 1.35],
      });
    });

    act(() => {
      fireEvent.click(screen.getByRole("button", { name: "seed-in-bounds" }));
    });
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Submit" })).toBeEnabled();
    });
  });

  // The disabled submit button swallows clicks, so these drive the form's submit event directly —
  // the path Enter-to-submit and requestSubmit() take — to reach the handler's own guard.
  it("blocks the submit handler when the adjusted pin is outside centerBounds", async () => {
    document.body.innerHTML = `
      <form id="address-form">
        <div data-type="address-form" data-map-style="Standard,Light"></div>
        <button data-type="address-form" type="submit">Submit</button>
      </form>
    `;
    const onSubmit = vi.fn();

    act(() => {
      render({
        root: "#address-form",
        apiKey: "test-key",
        region: "ap-southeast-1",
        centerBounds: grabBounds,
        initialMapCenter: [103.85, 1.35],
        onSubmit,
      });
    });

    act(() => {
      fireEvent.click(screen.getByRole("button", { name: "seed-out-of-bounds" }));
    });
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Submit" })).toBeDisabled();
    });

    fireEvent.submit(document.querySelector("#address-form")!);

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("runs the submit handler when the adjusted pin is inside centerBounds", async () => {
    document.body.innerHTML = `
      <form id="address-form">
        <div data-type="address-form" data-map-style="Standard,Light"></div>
        <button data-type="address-form" type="submit">Submit</button>
      </form>
    `;
    const onSubmit = vi.fn();

    act(() => {
      render({
        root: "#address-form",
        apiKey: "test-key",
        region: "ap-southeast-1",
        centerBounds: grabBounds,
        initialMapCenter: [103.85, 1.35],
        onSubmit,
      });
    });

    act(() => {
      fireEvent.click(screen.getByRole("button", { name: "seed-in-bounds" }));
    });
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Submit" })).toBeEnabled();
    });

    fireEvent.submit(document.querySelector("#address-form")!);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
  });
});
