import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithProvider } from "../../test/utils";
import { Map } from "./index";

vi.mock("react-map-gl/maplibre", () => {
  return {
    default: vi.fn(({ children, mapStyle }) => (
      <div data-testid="mock-maplibre-map" data-mapstyle={mapStyle}>
        {children}
      </div>
    )),
    NavigationControl: vi.fn(() => <div data-testid="mock-navigation-control" />),
  };
});

vi.mock("../../icons/Logo.tsx", () => ({
  Logo: vi.fn(({ mode }) => <div data-testid="mock-logo" data-mode={mode} />),
}));

vi.mock("./styles.css.ts", () => ({
  logo: "logo-class",
}));

describe("Map Component", () => {
  it("renders the MaplibreMap component with correct props", () => {
    renderWithProvider(<Map mapStyle={["Standard", "Light"]} />);
    const mapComponent = screen.getByTestId("mock-maplibre-map");
    expect(mapComponent).toBeInTheDocument();
    const expectedMapStyle =
      "https://maps.geo.us-east-1.amazonaws.com/v2/styles/Standard/descriptor?key=test-api-key&color-scheme=Light";
    expect(mapComponent).toHaveAttribute("data-mapstyle", expectedMapStyle);
  });

  it("renders the NavigationControl when navigationControl is true", () => {
    renderWithProvider(<Map mapStyle={["Standard", "Light"]} showNavigationControl={true} />);
    const navigationControl = screen.getByTestId("mock-navigation-control");
    expect(navigationControl).toBeInTheDocument();
  });

  it("does not render the NavigationControl when navigationControl is false", () => {
    renderWithProvider(<Map mapStyle={["Standard", "Light"]} showNavigationControl={false} />);
    expect(screen.queryByTestId("mock-navigation-control")).not.toBeInTheDocument();
  });

  it("renders the Logo with correct mode for Standard mapStyle", () => {
    renderWithProvider(<Map mapStyle={["Standard", "Light"]} />);
    const logo = screen.getByTestId("mock-logo");
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute("data-mode", "Light");
  });

  it("renders the Logo with correct mode for Monochrome mapStyle", () => {
    renderWithProvider(<Map mapStyle={["Monochrome", "Dark"]} />);
    const logo = screen.getByTestId("mock-logo");
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute("data-mode", "Dark");
  });

  it("renders the Logo with Dark mode for Satellite mapStyle", () => {
    renderWithProvider(<Map mapStyle={["Satellite", "Light"]} />);
    const logo = screen.getByTestId("mock-logo");
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute("data-mode", "Dark");
  });

  it("renders the Logo with Dark mode for Hybrid mapStyle", () => {
    renderWithProvider(<Map mapStyle={["Hybrid", "Light"]} />);
    const logo = screen.getByTestId("mock-logo");
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute("data-mode", "Dark");
  });

  it("includes politicalView in the mapStyle URL when provided", () => {
    renderWithProvider(<Map mapStyle={["Standard", "Light"]} politicalView="IN" />);
    const mapComponent = screen.getByTestId("mock-maplibre-map");
    const expectedMapStyle =
      "https://maps.geo.us-east-1.amazonaws.com/v2/styles/Standard/descriptor?key=test-api-key&color-scheme=Light&political-view=IN";
    expect(mapComponent).toHaveAttribute("data-mapstyle", expectedMapStyle);
  });

  it("does not include colorScheme in the mapStyle URL for Satellite style", () => {
    renderWithProvider(<Map mapStyle={["Satellite", "Light"]} />);
    const mapComponent = screen.getByTestId("mock-maplibre-map");
    const expectedMapStyle = "https://maps.geo.us-east-1.amazonaws.com/v2/styles/Satellite/descriptor?key=test-api-key";
    expect(mapComponent).toHaveAttribute("data-mapstyle", expectedMapStyle);
  });

  it("uses the provided mapStyleUrl directly when specified", () => {
    const customMapStyleUrl = "https://custom-map-style-url.com/style.json";
    renderWithProvider(<Map mapStyle={customMapStyleUrl} />);
    const mapComponent = screen.getByTestId("mock-maplibre-map");
    expect(mapComponent).toHaveAttribute("data-mapstyle", customMapStyleUrl);
  });

  it("ignores mapStyle, colorScheme, and politicalView when mapStyleUrl is provided", () => {
    const customMapStyleUrl = "https://custom-map-style-url.com/style.json";
    renderWithProvider(<Map politicalView="IN" mapStyle={customMapStyleUrl} />);
    const mapComponent = screen.getByTestId("mock-maplibre-map");
    expect(mapComponent).toHaveAttribute("data-mapstyle", customMapStyleUrl);
    // Verify it doesn't contain the default URL parameters
    expect(mapComponent.getAttribute("data-mapstyle")).not.toContain("color-scheme");
    expect(mapComponent.getAttribute("data-mapstyle")).not.toContain("political-view");
  });

  it("renders the Logo with Dark mode when mapStyle is geo URL with Dark color-scheme", () => {
    renderWithProvider(<Map mapStyle="geo://Standard?color-scheme=Dark&variant=Default" />);
    const logo = screen.getByTestId("mock-logo");
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute("data-mode", "Dark");
  });
});
