import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProvider } from "../../test/utils";
import * as api from "../../utils/api";
import { LocateButton } from "./index";
import { useNotificationStore } from "../../stores/notificationStore";
import { GeoPlacesClient } from "@aws-sdk/client-geo-places";

vi.mock("../../utils/api", () => ({
  reverseGeocode: vi.fn(),
}));

vi.mock("../../icons/Locate", () => ({
  Locate: () => <div data-testid="locate-icon">Locate Icon</div>,
}));

describe("LocateButton Component", () => {
  const mockProps = {
    onLocate: vi.fn(),
  };

  const mockGeolocation = {
    getCurrentPosition: vi.fn(),
    watchPosition: vi.fn(),
    clearWatch: vi.fn(),
  };

  beforeEach(() => {
    Object.defineProperty(global.navigator, "geolocation", {
      value: mockGeolocation,
      configurable: true,
    });
    vi.clearAllMocks();
    // The notification store is a module-level zustand store shared across tests.
    useNotificationStore.getState().clearNotifications();
  });

  it("renders correctly with default props", () => {
    renderWithProvider(<LocateButton onLocate={() => {}} />);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button.className).toContain("styleButton");
    expect(screen.getByTestId("locate-icon")).toBeInTheDocument();
  });

  it("does not show tooltip when button is enabled", () => {
    renderWithProvider(<LocateButton onLocate={() => {}} />);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("shows tooltip when button is disabled due to geolocation error", async () => {
    mockGeolocation.getCurrentPosition.mockImplementation((_success, error) => {
      error({ message: "User denied Geolocation" });
    });
    renderWithProvider(<LocateButton {...mockProps} />);
    fireEvent.click(screen.getByRole("button"));
    await waitFor(() => {
      expect(screen.getByRole("tooltip")).toHaveTextContent("Current location is unavailable");
      expect(screen.getByRole("button")).toBeDisabled();
    });
  });

  it("shows tooltip when geolocation is not supported", () => {
    Object.defineProperty(global.navigator, "geolocation", {
      value: undefined,
      configurable: true,
    });
    renderWithProvider(<LocateButton {...mockProps} />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("tooltip")).toHaveTextContent("Current location is unavailable");
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("handles click and gets current location", async () => {
    mockGeolocation.getCurrentPosition.mockImplementation((success) => {
      success({
        coords: {
          latitude: 47.6062,
          longitude: -122.3321,
        },
      });
    });
    vi.mocked(api.reverseGeocode).mockResolvedValue({
      ResultItems: [
        {
          Address: {
            AddressNumber: "123",
            Street: "Main St",
            Country: {
              Name: "Canada",
            },
          },
          Position: [-122.3321, 47.6062],
          PlaceId: undefined,
          PlaceType: undefined,
          Title: undefined,
        },
      ],
      PricingBucket: "mock-pricing-bucket",
      $metadata: {},
    });
    renderWithProvider(<LocateButton {...mockProps} />);
    const button = screen.getByRole("button");
    fireEvent.click(button);
    await waitFor(() => {
      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
      expect(api.reverseGeocode).toHaveBeenCalledWith(expect.any(GeoPlacesClient), {
        QueryPosition: [-122.3321, 47.6062],
      });
      expect(mockProps.onLocate).toHaveBeenCalledWith({
        addressLineOneField: "123 Main St",
        fullAddress: {
          AddressNumber: "123",
          Street: "Main St",
          Country: {
            Name: "Canada",
          },
        },
        position: [-122.3321, 47.6062],
      });
    });
  });

  it("warns and skips the lookup when the device is outside queryBounds", async () => {
    mockGeolocation.getCurrentPosition.mockImplementation((success) => {
      // Vancouver, well outside the Singapore-ish bounds below.
      success({ coords: { latitude: 49.2827, longitude: -123.1207 } });
    });
    renderWithProvider(
      <LocateButton
        {...mockProps}
        queryBounds={[
          [103.6, 1.2],
          [104.1, 1.5],
        ]}
      />,
    );
    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(useNotificationStore.getState().notifications).toEqual([
        expect.objectContaining({ type: "warning", message: "Your current location is outside the supported region" }),
      ]);
    });
    // Clamping into the box would have returned a real in-region address for a device in Canada.
    expect(api.reverseGeocode).not.toHaveBeenCalled();
    expect(mockProps.onLocate).not.toHaveBeenCalled();
  });

  it("passes the unclamped position through when the device is inside queryBounds", async () => {
    mockGeolocation.getCurrentPosition.mockImplementation((success) => {
      success({ coords: { latitude: 1.3521, longitude: 103.8198 } });
    });
    vi.mocked(api.reverseGeocode).mockResolvedValue({
      ResultItems: [
        {
          Address: { AddressNumber: "1", Street: "Marina Blvd" },
          Position: [103.8198, 1.3521],
          PlaceId: "sg-1",
          PlaceType: undefined,
          Title: undefined,
        },
      ],
      PricingBucket: "mock-pricing-bucket",
      $metadata: {},
    });
    renderWithProvider(
      <LocateButton
        {...mockProps}
        queryBounds={[
          [103.6, 1.2],
          [104.1, 1.5],
        ]}
      />,
    );
    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(api.reverseGeocode).toHaveBeenCalledWith(expect.any(GeoPlacesClient), {
        QueryPosition: [103.8198, 1.3521],
      });
    });
    expect(useNotificationStore.getState().notifications).toEqual([]);
  });

  it("shows warning notification when no results are returned", async () => {
    mockGeolocation.getCurrentPosition.mockImplementation((success) => {
      success({
        coords: {
          latitude: 47.6062,
          longitude: -122.3321,
        },
      });
    });
    vi.mocked(api.reverseGeocode).mockResolvedValue({
      ResultItems: [],
      PricingBucket: "mock-pricing-bucket",
      $metadata: {},
    });
    renderWithProvider(<LocateButton {...mockProps} />);
    fireEvent.click(screen.getByRole("button"));
    await waitFor(() => {
      expect(mockProps.onLocate).not.toHaveBeenCalled();
    });
  });
});
