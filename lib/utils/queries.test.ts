import { QueryClient } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as api from "./api";
import { autocompleteQuery, getPlaceQuery, reverseGeocodeQuery, suggestQuery } from "./queries";
import { GeoPlacesClient } from "@aws-sdk/client-geo-places";

vi.mock("./api", () => ({
  autocomplete: vi.fn(() => []),
  suggest: vi.fn(() => []),
  reverseGeocode: vi.fn(() => []),
  getPlace: vi.fn(() => []),
}));

let client: QueryClient;
let geoPlacesClient: GeoPlacesClient;

beforeEach(() => {
  client = new QueryClient();
  geoPlacesClient = new GeoPlacesClient();
  vi.clearAllMocks();
});

describe("autocompleteQuery", () => {
  it("should call autocomplete api", () => {
    const input = { QueryText: "510 W Georgia St" };

    const query = autocompleteQuery(geoPlacesClient, input);
    client.ensureQueryData(query);

    expect(query.queryKey).toEqual(["autocomplete", input]);
    expect(api.autocomplete).toBeCalledWith(geoPlacesClient, input);
  });

  it("should use cached results in the second call", () => {
    const input = { QueryText: "510 W Georgia St" };

    const firstCallResults = client.ensureQueryData(autocompleteQuery(geoPlacesClient, input));
    const secondCallResults = client.ensureQueryData(autocompleteQuery(geoPlacesClient, input));

    expect(firstCallResults).toEqual(secondCallResults);
    expect(api.autocomplete).toBeCalledTimes(1);
  });

  it("should not use cached results in the second call for different input", () => {
    client.ensureQueryData(autocompleteQuery(geoPlacesClient, { QueryText: "510 W Georgia St" }));
    client.ensureQueryData(autocompleteQuery(geoPlacesClient, { QueryText: "399 W Georgia St" }));

    expect(api.autocomplete).toBeCalledTimes(2);
  });
});

describe("suggestQuery", () => {
  it("should call suggest api", () => {
    const input = { QueryText: "rest" };
    const query = suggestQuery(geoPlacesClient, input);

    client.ensureQueryData(query);

    expect(query.queryKey).toEqual(["suggest", input]);
    expect(api.suggest).toBeCalledWith(geoPlacesClient, input);
  });

  it("should use cached results in the second call", () => {
    const input = { QueryText: "rest" };

    const firstCallResults = client.ensureQueryData(suggestQuery(geoPlacesClient, input));
    const secondCallResults = client.ensureQueryData(suggestQuery(geoPlacesClient, input));

    expect(firstCallResults).toEqual(secondCallResults);
    expect(api.suggest).toBeCalledTimes(1);
  });

  it("should not use cached results in the second call for different input", () => {
    client.ensureQueryData(suggestQuery(geoPlacesClient, { QueryText: "rest" }));
    client.ensureQueryData(suggestQuery(geoPlacesClient, { QueryText: "bar" }));

    expect(api.suggest).toBeCalledTimes(2);
  });
});

describe("reverseGeocodeQuery", () => {
  it("should call reverse geocode api", () => {
    const input = { QueryPosition: [-123.11694, 49.28126] };
    const query = reverseGeocodeQuery(geoPlacesClient, input);

    client.ensureQueryData(query);

    expect(query.queryKey).toEqual(["reverseGeocode", input]);
    expect(api.reverseGeocode).toBeCalledWith(geoPlacesClient, input);
  });

  it("should use cached results in the second call", () => {
    const input = { QueryPosition: [-123.11694, 49.28126] };

    const firstCallResults = client.ensureQueryData(reverseGeocodeQuery(geoPlacesClient, input));
    const secondCallResults = client.ensureQueryData(reverseGeocodeQuery(geoPlacesClient, input));

    expect(firstCallResults).toEqual(secondCallResults);
    expect(api.reverseGeocode).toBeCalledTimes(1);
  });

  it("should not use cached results in the second call for different input", () => {
    client.ensureQueryData(reverseGeocodeQuery(geoPlacesClient, { QueryPosition: [-123, 49] }));
    client.ensureQueryData(reverseGeocodeQuery(geoPlacesClient, { QueryPosition: [-120, 49] }));

    expect(api.reverseGeocode).toBeCalledTimes(2);
  });
});

describe("getPlaceQuery", () => {
  it("should call get place api", () => {
    const input = { PlaceId: "123" };
    const query = getPlaceQuery(geoPlacesClient, input);

    client.ensureQueryData(query);

    expect(query.queryKey).toEqual(["getPlace", input]);
    expect(api.getPlace).toBeCalledWith(geoPlacesClient, input);
  });

  it("should use cached results in the second call", () => {
    const input = { PlaceId: "123" };

    const firstCallResults = client.ensureQueryData(getPlaceQuery(geoPlacesClient, input));
    const secondCallResults = client.ensureQueryData(getPlaceQuery(geoPlacesClient, input));

    expect(firstCallResults).toEqual(secondCallResults);
    expect(api.getPlace).toBeCalledTimes(1);
  });

  it("should not use cached results in the second call for different input", () => {
    client.ensureQueryData(getPlaceQuery(geoPlacesClient, { PlaceId: "123" }));
    client.ensureQueryData(getPlaceQuery(geoPlacesClient, { PlaceId: "456" }));

    expect(api.getPlace).toBeCalledTimes(2);
  });
});
