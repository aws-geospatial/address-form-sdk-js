import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProvider } from "../../test/utils";
import * as api from "../../utils/api";
import { LocateButton } from "./index";
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
