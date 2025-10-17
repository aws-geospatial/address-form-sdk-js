import { describe, expect, it } from "vitest";
import { getBoolean, getString } from "./utils";

describe("getBoolean", () => {
  it('returns true when property exists and is not "false"', () => {
    expect(getBoolean({ test: "true" }, "test")).toBe(true);
    expect(getBoolean({ test: true }, "test")).toBe(true);
    expect(getBoolean({ test: "any-value" }, "test")).toBe(true);
  });

  it('returns false when property exists and is "false"', () => {
    expect(getBoolean({ test: "false" }, "test")).toBe(false);
  });

  it("returns undefined when property does not exist", () => {
    expect(getBoolean({}, "test")).toBeUndefined();
    expect(getBoolean({ other: "value" }, "test")).toBeUndefined();
  });
});

describe("getString", () => {
  it("returns string value when property exists", () => {
    expect(getString({ test: "value" }, "test")).toBe("value");
    expect(getString({ test: 123 }, "test")).toBe("123");
    expect(getString({ test: true }, "test")).toBe("true");
  });

  it("returns undefined when property does not exist", () => {
    expect(getString({}, "test")).toBeUndefined();
    expect(getString({ other: "value" }, "test")).toBeUndefined();
  });
});
