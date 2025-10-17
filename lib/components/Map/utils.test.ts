import { describe, expect, it } from "vitest";
import { getMapStyleType, getColorScheme } from "./utils";
import { ColorScheme, MapStyle, MapStyleType } from "./index";

describe("getMapStyleType", () => {
  it("should return the first element when extendedMapStyle is an array with MapStyleType", () => {
    const mapStyle: MapStyle = ["Standard", "Light"];
    const result = getMapStyleType(mapStyle);
    expect(result).toBe("Standard");
  });

  it("should return the first element when extendedMapStyle is an array with different MapStyleType", () => {
    const mapStyle: MapStyle = ["Monochrome", "Dark"];
    const result = getMapStyleType(mapStyle);
    expect(result).toBe("Monochrome");
  });

  it("should return the first element when extendedMapStyle is an array with Hybrid", () => {
    const mapStyle: MapStyle = ["Hybrid", "Light"];
    const result = getMapStyleType(mapStyle);
    expect(result).toBe("Hybrid");
  });

  it("should return the first element when extendedMapStyle is an array with Satellite", () => {
    const mapStyle: MapStyle = ["Satellite", "Light"];
    const result = getMapStyleType(mapStyle);
    expect(result).toBe("Satellite");
  });

  it("should return default value when extendedMapStyle is not an array", () => {
    const mapStyle = "custom-map-style-url" as MapStyle;
    const result = getMapStyleType(mapStyle);
    expect(result).toBe("Standard");
  });

  it("should return custom default value when extendedMapStyle is not an array", () => {
    const mapStyle = "custom-map-style-url" as MapStyle;
    const customDefault: MapStyleType = "Monochrome";
    const result = getMapStyleType(mapStyle, customDefault);
    expect(result).toBe("Monochrome");
  });

  it("should return default value when first element of array is undefined", () => {
    const mapStyle = [undefined, "Light"] as unknown as MapStyle;
    const result = getMapStyleType(mapStyle);
    expect(result).toBe("Standard");
  });

  it("should return custom default value when first element of array is undefined", () => {
    const mapStyle = [undefined, "Light"] as unknown as MapStyle;
    const customDefault: MapStyleType = "Hybrid";
    const result = getMapStyleType(mapStyle, customDefault);
    expect(result).toBe("Hybrid");
  });

  it("should return default value when first element of array is null", () => {
    const mapStyle = [null, "Light"] as unknown as MapStyle;
    const result = getMapStyleType(mapStyle);
    expect(result).toBe("Standard");
  });

  it("should handle empty array", () => {
    const mapStyle = [] as unknown as MapStyle;
    const result = getMapStyleType(mapStyle);
    expect(result).toBe("Standard");
  });

  it("should handle array with only one element", () => {
    const mapStyle = ["Monochrome"] as unknown as MapStyle;
    const result = getMapStyleType(mapStyle);
    expect(result).toBe("Monochrome");
  });
});

describe("getColorScheme", () => {
  it("should return the second element when extendedMapStyle is an array with ColorScheme", () => {
    const mapStyle: MapStyle = ["Standard", "Light"];
    const result = getColorScheme(mapStyle);
    expect(result).toBe("Light");
  });

  it("should return the second element when extendedMapStyle is an array with Dark ColorScheme", () => {
    const mapStyle: MapStyle = ["Monochrome", "Dark"];
    const result = getColorScheme(mapStyle);
    expect(result).toBe("Dark");
  });

  it("should return default value when extendedMapStyle is not an array", () => {
    const mapStyle = "custom-map-style-url" as MapStyle;
    const result = getColorScheme(mapStyle);
    expect(result).toBe("Light");
  });

  it("should return custom default value when extendedMapStyle is not an array", () => {
    const mapStyle = "custom-map-style-url" as MapStyle;
    const customDefault: ColorScheme = "Dark";
    const result = getColorScheme(mapStyle, customDefault);
    expect(result).toBe("Dark");
  });

  it("should return default value when second element of array is undefined", () => {
    const mapStyle = ["Standard", undefined] as unknown as MapStyle;
    const result = getColorScheme(mapStyle);
    expect(result).toBe("Light");
  });

  it("should return custom default value when second element of array is undefined", () => {
    const mapStyle = ["Standard", undefined] as unknown as MapStyle;
    const customDefault: ColorScheme = "Dark";
    const result = getColorScheme(mapStyle, customDefault);
    expect(result).toBe("Dark");
  });

  it("should return default value when second element of array is null", () => {
    const mapStyle = ["Standard", null] as unknown as MapStyle;
    const result = getColorScheme(mapStyle);
    expect(result).toBe("Light");
  });

  it("should handle empty array", () => {
    const mapStyle = [] as unknown as MapStyle;
    const result = getColorScheme(mapStyle);
    expect(result).toBe("Light");
  });

  it("should handle array with only one element", () => {
    const mapStyle = ["Standard"] as unknown as MapStyle;
    const result = getColorScheme(mapStyle);
    expect(result).toBe("Light");
  });

  it("should handle array with more than two elements", () => {
    const mapStyle = ["Standard", "Dark", "extra"] as unknown as MapStyle;
    const result = getColorScheme(mapStyle);
    expect(result).toBe("Dark");
  });
});

describe("edge cases", () => {
  it("should handle null input for getMapStyleType", () => {
    const mapStyle = null as unknown as MapStyle;
    const result = getMapStyleType(mapStyle);
    expect(result).toBe("Standard");
  });

  it("should handle undefined input for getMapStyleType", () => {
    const mapStyle = undefined as unknown as MapStyle;
    const result = getMapStyleType(mapStyle);
    expect(result).toBe("Standard");
  });

  it("should handle null input for getColorScheme", () => {
    const mapStyle = null as unknown as MapStyle;
    const result = getColorScheme(mapStyle);
    expect(result).toBe("Light");
  });

  it("should handle undefined input for getColorScheme", () => {
    const mapStyle = undefined as unknown as MapStyle;
    const result = getColorScheme(mapStyle);
    expect(result).toBe("Light");
  });
});
