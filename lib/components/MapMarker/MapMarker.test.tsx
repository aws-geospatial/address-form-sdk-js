import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MapMarker } from "./index";

vi.mock("react-map-gl/maplibre", () => ({
  Marker: (props: { longitude: number; latitude: number; color: string }) => (
    <div
      data-testid="coordinate-marker"
      data-longitude={props.longitude}
      data-latitude={props.latitude}
      data-color={props.color}
    />
  ),
}));

vi.mock("./styles.css.ts", () => ({
  pinContainer: "pinContainer",
  adjustmentMessageContainer: "adjustmentMessageContainer",
}));

vi.mock("../AdjustButton", () => ({
  AdjustButton: ({ children, ...props }: { children: React.ReactNode; onClick?: () => void }) => (
    <button {...props}>{children}</button>
  ),
}));

describe("MapMarker", () => {
  it("renders the pin", () => {
    const { container } = render(<MapMarker />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("shows drag instruction when position has not been adjusted", () => {
    render(<MapMarker />);
    expect(screen.getByText("Move the map to adjust pin location")).toBeInTheDocument();
  });

  it("shows adjusted message and Undo adjustment button when position has been adjusted", () => {
    render(<MapMarker hasAdjustedPosition={true} onReset={vi.fn()} />);
    expect(screen.getByText("Location adjusted")).toBeInTheDocument();
    expect(screen.getByText("Undo adjustment")).toBeInTheDocument();
  });

  it("does not show instructions when adjustablePosition is false", () => {
    render(<MapMarker adjustablePosition={false} />);
    expect(screen.queryByText("Move the map to adjust pin location")).not.toBeInTheDocument();
  });

  it("does not show Undo adjustment button when adjustablePosition is false even if adjusted", () => {
    render(<MapMarker adjustablePosition={false} hasAdjustedPosition={true} onReset={vi.fn()} />);
    expect(screen.queryByText("Undo adjustment")).not.toBeInTheDocument();
  });

  it("calls onReset when Undo adjustment button is clicked", async () => {
    const onReset = vi.fn();
    render(<MapMarker hasAdjustedPosition={true} onReset={onReset} />);
    await userEvent.click(screen.getByText("Undo adjustment"));
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it("renders dark color scheme pin", () => {
    const { container } = render(<MapMarker colorScheme="Dark" />);
    const groups = container.querySelectorAll("g[fill]");
    const bgGroup = Array.from(groups).find((g) => g.getAttribute("fill") === "#ffffff");
    expect(bgGroup).toBeInTheDocument();
  });

  it("renders light color scheme pin by default", () => {
    const { container } = render(<MapMarker colorScheme="Light" />);
    const groups = container.querySelectorAll("g[fill]");
    const bgGroup = Array.from(groups).find((g) => g.getAttribute("fill") === "#000000");
    expect(bgGroup).toBeInTheDocument();
  });

  describe("when adjustablePosition is false", () => {
    it("renders nothing when markerPosition is not provided", () => {
      const { container } = render(<MapMarker adjustablePosition={false} />);
      expect(container.innerHTML).toBe("");
    });

    it("renders a coordinate-based marker at the given position", () => {
      render(<MapMarker adjustablePosition={false} markerPosition={[-122.4, 47.6]} />);
      const marker = screen.getByTestId("coordinate-marker");
      expect(marker).toHaveAttribute("data-longitude", "-122.4");
      expect(marker).toHaveAttribute("data-latitude", "47.6");
    });

    it("does not render the center-fixed SVG pin", () => {
      const { container } = render(<MapMarker adjustablePosition={false} markerPosition={[-122.4, 47.6]} />);
      expect(container.querySelector("svg")).not.toBeInTheDocument();
    });
  });
});
