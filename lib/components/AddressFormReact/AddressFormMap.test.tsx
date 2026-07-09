import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddressFormMap } from "./AddressFormMap";
import { AddressFormContext, AddressFormContextType } from "./AddressFormContext";

let capturedOnMove: (event: { viewState: { longitude: number; latitude: number; zoom: number } }) => void;

vi.mock("../Map", () => ({
  Map: vi.fn(({ children, onMove, ...props }) => {
    capturedOnMove = onMove;
    return (
      <div data-testid="mock-map" data-map-style={props.mapStyle?.toString()}>
        {children}
      </div>
    );
  }),
}));

vi.mock("../MapMarker", () => ({
  MapMarker: vi.fn((props) => (
    <div
      data-testid="mock-map-marker"
      data-adjustable-position={props.adjustablePosition?.toString()}
      data-has-adjusted-position={props.hasAdjustedPosition?.toString()}
    >
      {props.hasAdjustedPosition && (
        <button data-testid="reset-button" onClick={props.onReset}>
          Reset
        </button>
      )}
    </div>
  )),
}));

const createContext = (overrides: Partial<AddressFormContextType> = {}): AddressFormContextType => ({
  apiKey: "test-key",
  region: "us-east-1",
  data: {},
  setData: vi.fn(),
  mapViewState: { longitude: -122.4, latitude: 47.6, zoom: 10 },
  setMapViewState: vi.fn(),
  isAutofill: false,
  setIsAutofill: vi.fn(),
  typeaheadApiName: "autocomplete",
  setTypeaheadApiName: vi.fn(),
  ...overrides,
});

describe("AddressFormMap", () => {
  it("renders Map component", () => {
    const ctx = createContext();
    render(
      <AddressFormContext.Provider value={ctx}>
        <AddressFormMap mapStyle={["Standard", "Light"]} />
      </AddressFormContext.Provider>,
    );
    expect(screen.getByTestId("mock-map")).toBeInTheDocument();
  });

  it("does not render MapMarker when no originalPosition exists", () => {
    const ctx = createContext({ data: {} });
    render(
      <AddressFormContext.Provider value={ctx}>
        <AddressFormMap mapStyle={["Standard", "Light"]} />
      </AddressFormContext.Provider>,
    );
    expect(screen.queryByTestId("mock-map-marker")).not.toBeInTheDocument();
  });

  it("renders MapMarker when originalPosition exists", () => {
    const ctx = createContext({ data: { originalPosition: "-122.4,47.6" } });
    render(
      <AddressFormContext.Provider value={ctx}>
        <AddressFormMap mapStyle={["Standard", "Light"]} />
      </AddressFormContext.Provider>,
    );
    expect(screen.getByTestId("mock-map-marker")).toBeInTheDocument();
  });

  it("sets adjustedPosition when map is panned away from original", () => {
    const setData = vi.fn();
    const ctx = createContext({
      data: { originalPosition: "-122.4,47.6" },
      setData,
    });
    render(
      <AddressFormContext.Provider value={ctx}>
        <AddressFormMap mapStyle={["Standard", "Light"]} adjustablePosition={true} />
      </AddressFormContext.Provider>,
    );

    capturedOnMove({ viewState: { longitude: -122.5, latitude: 47.7, zoom: 10 } });
    expect(setData).toHaveBeenCalledWith({ adjustedPosition: "-122.5,47.7" });
  });

  it("clears adjustedPosition when map is panned back to original", () => {
    const setData = vi.fn();
    const ctx = createContext({
      data: { originalPosition: "-122.4,47.6", adjustedPosition: "-122.5,47.7" },
      setData,
    });
    render(
      <AddressFormContext.Provider value={ctx}>
        <AddressFormMap mapStyle={["Standard", "Light"]} adjustablePosition={true} />
      </AddressFormContext.Provider>,
    );

    capturedOnMove({ viewState: { longitude: -122.4, latitude: 47.6, zoom: 10 } });
    expect(setData).toHaveBeenCalledWith({ adjustedPosition: undefined });
  });

  it("does not set adjustedPosition when adjustablePosition is false", () => {
    const setData = vi.fn();
    const ctx = createContext({
      data: { originalPosition: "-122.4,47.6" },
      setData,
    });
    render(
      <AddressFormContext.Provider value={ctx}>
        <AddressFormMap mapStyle={["Standard", "Light"]} adjustablePosition={false} />
      </AddressFormContext.Provider>,
    );

    capturedOnMove({ viewState: { longitude: -122.5, latitude: 47.7, zoom: 10 } });
    // setData should not have been called with adjustedPosition (only setMapViewState)
    expect(setData).not.toHaveBeenCalled();
  });

  it("resets map to original position when Reset is clicked", async () => {
    const setData = vi.fn();
    const setMapViewState = vi.fn();
    const ctx = createContext({
      data: { originalPosition: "-122.4,47.6", adjustedPosition: "-122.5,47.7" },
      mapViewState: { longitude: -122.5, latitude: 47.7, zoom: 10 },
      setData,
      setMapViewState,
    });
    render(
      <AddressFormContext.Provider value={ctx}>
        <AddressFormMap mapStyle={["Standard", "Light"]} adjustablePosition={true} />
      </AddressFormContext.Provider>,
    );

    await userEvent.click(screen.getByTestId("reset-button"));
    expect(setMapViewState).toHaveBeenCalledWith({ longitude: -122.4, latitude: 47.6, zoom: 10 });
    expect(setData).toHaveBeenCalledWith({ adjustedPosition: undefined });
  });

  it("passes mapStyle to Map component", () => {
    const ctx = createContext({ data: { originalPosition: "-122.4,47.6" } });
    render(
      <AddressFormContext.Provider value={ctx}>
        <AddressFormMap mapStyle={["Standard", "Dark"]} />
      </AddressFormContext.Provider>,
    );
    expect(screen.getByTestId("mock-map")).toHaveAttribute("data-map-style", "Standard,Dark");
  });
});
