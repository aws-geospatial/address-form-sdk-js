import { describe, expect, it } from "vitest";
import { clampCenterToBounds, isCenterWithinBounds, type CenterBounds } from "./bounds";

// Singapore-ish box used across the SDK tests: [[west, south], [east, north]].
const bounds: CenterBounds = [
  [103.6, 1.2],
  [104.1, 1.5],
];

describe("clampCenterToBounds", () => {
  it("returns the center unchanged when no bounds are given", () => {
    expect(clampCenterToBounds([200, 90])).toEqual([200, 90]);
  });

  it("returns the center unchanged when already inside", () => {
    expect(clampCenterToBounds([103.85, 1.35], bounds)).toEqual([103.85, 1.35]);
  });

  it("clamps longitude below west up to west", () => {
    expect(clampCenterToBounds([100, 1.35], bounds)).toEqual([103.6, 1.35]);
  });

  it("clamps longitude above east down to east", () => {
    expect(clampCenterToBounds([105, 1.35], bounds)).toEqual([104.1, 1.35]);
  });

  it("clamps latitude below south up to south", () => {
    expect(clampCenterToBounds([103.85, 0], bounds)).toEqual([103.85, 1.2]);
  });

  it("clamps latitude above north down to north", () => {
    expect(clampCenterToBounds([103.85, 5], bounds)).toEqual([103.85, 1.5]);
  });

  it("clamps a point outside on both axes to the nearest corner", () => {
    expect(clampCenterToBounds([200, 90], bounds)).toEqual([104.1, 1.5]);
    expect(clampCenterToBounds([0, -90], bounds)).toEqual([103.6, 1.2]);
  });

  it("is idempotent", () => {
    const once = clampCenterToBounds([200, 90], bounds);
    expect(clampCenterToBounds(once, bounds)).toEqual(once);
  });
});

describe("isCenterWithinBounds", () => {
  it("is true when no bounds are given", () => {
    expect(isCenterWithinBounds([200, 90])).toBe(true);
  });

  it("is true for a point strictly inside", () => {
    expect(isCenterWithinBounds([103.85, 1.35], bounds)).toBe(true);
  });

  it("is inclusive of the edges (a clamped point reads as within)", () => {
    expect(isCenterWithinBounds([103.6, 1.35], bounds)).toBe(true);
    expect(isCenterWithinBounds([104.1, 1.35], bounds)).toBe(true);
    expect(isCenterWithinBounds([103.85, 1.2], bounds)).toBe(true);
    expect(isCenterWithinBounds([103.85, 1.5], bounds)).toBe(true);
    expect(isCenterWithinBounds(clampCenterToBounds([200, 90], bounds), bounds)).toBe(true);
  });

  it("is false when outside on either axis", () => {
    expect(isCenterWithinBounds([100, 1.35], bounds)).toBe(false);
    expect(isCenterWithinBounds([105, 1.35], bounds)).toBe(false);
    expect(isCenterWithinBounds([103.85, 0], bounds)).toBe(false);
    expect(isCenterWithinBounds([103.85, 5], bounds)).toBe(false);
  });
});
