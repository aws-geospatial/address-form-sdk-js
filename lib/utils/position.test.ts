import { describe, it, expect } from "vitest";
import { positionToString } from "./position";

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
