import { describe, it, expect } from "vitest";
import { isSamePosition, positionToString } from "./position";

describe("positionToString", () => {
  it("converts coordinates to string with 6 decimal places", () => {
    expect(positionToString([-122.4194, 37.7749])).toBe("-122.419400,37.774900");
  });

  it("handles zero coordinates", () => {
    expect(positionToString([0, 0])).toBe("0.000000,0.000000");
  });

  it("handles negative coordinates", () => {
    expect(positionToString([-1.5, -2.5])).toBe("-1.500000,-2.500000");
  });
});

describe("isSamePosition", () => {
  it("returns true for identical positions", () => {
    expect(isSamePosition([-122.4, 47.6], [-122.4, 47.6])).toBe(true);
  });

  it("returns false for different positions", () => {
    expect(isSamePosition([-122.4, 47.6], [-122.5, 47.7])).toBe(false);
  });

  it("returns false when first position is undefined", () => {
    expect(isSamePosition(undefined, [-122.4, 47.6])).toBe(false);
  });

  it("returns false when second position is undefined", () => {
    expect(isSamePosition([-122.4, 47.6], undefined)).toBe(false);
  });

  it("returns false when both positions are undefined", () => {
    expect(isSamePosition(undefined, undefined)).toBe(false);
  });
});
