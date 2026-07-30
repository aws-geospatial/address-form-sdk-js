import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AddressFormAddressField } from "./AddressFormAddressField";
import { AddressFormContext, AddressFormContextType } from "./AddressFormContext";
import type { TypeaheadProps } from "../Typeahead";

// Capture the props AddressFormAddressField hands to Typeahead so we can assert the
// clamped BiasPosition and forwarded queryBounds without driving the debounce/query machinery.
let capturedProps: TypeaheadProps | undefined;
vi.mock("../Typeahead", () => ({
  Typeahead: (props: TypeaheadProps) => {
    capturedProps = props;
    return <div data-testid="mock-typeahead" />;
  },
}));

const bounds: [[number, number], [number, number]] = [
  [103.6, 1.2],
  [104.1, 1.5],
];

const baseContext: AddressFormContextType = {
  apiKey: "test-key",
  region: "ap-southeast-1",
  data: {},
  setData: vi.fn(),
  setMapViewState: vi.fn(),
  isAutofill: false,
  setIsAutofill: vi.fn(),
  typeaheadApiName: "suggest",
  setTypeaheadApiName: vi.fn(),
};

const renderField = (ctx: AddressFormContextType) =>
  render(
    <AddressFormContext.Provider value={ctx}>
      <AddressFormAddressField name="addressLineOne" label="Address" showCurrentLocation apiName="suggest" />
    </AddressFormContext.Provider>,
  );

describe("AddressFormAddressField bias clamping", () => {
  it("clamps BiasPosition to centerBounds when the map center is outside the region", () => {
    renderField({
      ...baseContext,
      mapViewState: { longitude: 110, latitude: 1.35, zoom: 10 },
      centerBounds: bounds,
    });
    // Longitude 110 clamps to the east edge 104.1; latitude 1.35 is already inside.
    expect(capturedProps?.apiInput?.BiasPosition).toEqual([104.1, 1.35]);
    expect(capturedProps?.queryBounds).toEqual(bounds);
  });

  it("leaves BiasPosition unchanged when the center is inside the region", () => {
    renderField({
      ...baseContext,
      mapViewState: { longitude: 103.85, latitude: 1.35, zoom: 10 },
      centerBounds: bounds,
    });
    expect(capturedProps?.apiInput?.BiasPosition).toEqual([103.85, 1.35]);
  });

  it("leaves BiasPosition unchanged when no centerBounds are set", () => {
    renderField({
      ...baseContext,
      mapViewState: { longitude: 110, latitude: 1.35, zoom: 10 },
    });
    expect(capturedProps?.apiInput?.BiasPosition).toEqual([110, 1.35]);
    expect(capturedProps?.queryBounds).toBeUndefined();
  });
});
