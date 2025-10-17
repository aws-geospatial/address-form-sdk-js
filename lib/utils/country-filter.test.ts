import { describe, expect, it } from "vitest";
import { getIncludeCountriesFilter } from "./country-filter";

describe("getIncludeCountriesFilter", () => {
  it("returns current country when showCurrentCountryResultsOnly is true and currentCountry is provided", () => {
    const result = getIncludeCountriesFilter(true, "US", ["US", "CA", "MX"]);
    expect(result).toEqual(["US"]);
  });

  it("returns allowedCountries when showCurrentCountryResultsOnly is false", () => {
    const allowedCountries = ["US", "CA", "MX"];
    const result = getIncludeCountriesFilter(false, "US", allowedCountries);
    expect(result).toEqual(allowedCountries);
  });

  it("returns allowedCountries when showCurrentCountryResultsOnly is undefined", () => {
    const allowedCountries = ["US", "CA"];
    const result = getIncludeCountriesFilter(undefined, "US", allowedCountries);
    expect(result).toEqual(allowedCountries);
  });

  it("returns allowedCountries when currentCountry is undefined", () => {
    const allowedCountries = ["US", "CA"];
    const result = getIncludeCountriesFilter(true, undefined, allowedCountries);
    expect(result).toEqual(allowedCountries);
  });
});
