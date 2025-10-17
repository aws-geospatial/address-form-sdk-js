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
});
