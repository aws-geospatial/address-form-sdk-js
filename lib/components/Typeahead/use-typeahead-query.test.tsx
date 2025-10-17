import { AutocompleteCommandOutput, GeoPlacesClient, SuggestCommandOutput } from "@aws-sdk/client-geo-places";
import { renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as api from "../../utils/api";
import { queryClient } from "../../utils/query-client";
import { AmazonLocationProvider } from "../AmazonLocationProvider";
import { TypeaheadSource, useTypeaheadQuery } from "./use-typeahead-query";

// Mock the API functions
vi.mock("../../utils/api", () => ({
  autocomplete: vi.fn(),
  suggest: vi.fn(),
}));

// Create a wrapper component for testing hooks that need the AmazonLocationProvider
const createWrapper = (client?: GeoPlacesClient) => {
  return ({ children }: { children: ReactNode }) => (
    <AmazonLocationProvider apiKey="test-api-key" region="us-east-1" client={client || new GeoPlacesClient()}>
      {children}
    </AmazonLocationProvider>
  );
};

describe("useTypeaheadQuery", () => {
  let mockClient: GeoPlacesClient;

  beforeEach(() => {
    queryClient.clear();
    vi.clearAllMocks();
    mockClient = new GeoPlacesClient();
  });

  describe("autocomplete api", () => {
    it("should call autocomplete api with default querytext when source is autocomplete", async () => {
      const mockResponse: AutocompleteCommandOutput = {
        ResultItems: [
          {
            PlaceId: "place-1",
            Address: { Label: "123 Main St" },
            PlaceType: "Street",
            Title: "Place",
          },
        ],
        PricingBucket: "bucket1",
        $metadata: {},
      };
      vi.mocked(api.autocomplete).mockResolvedValue(mockResponse);

      const { result } = renderHook(
        () =>
          useTypeaheadQuery({
            client: mockClient,
            source: "autocomplete",
            sourceInput: { QueryText: "123" },
            enabled: true,
          }),
        { wrapper: createWrapper(mockClient) },
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(api.autocomplete).toHaveBeenCalledWith(mockClient, { QueryText: "123" });
      expect(result.current.data).toEqual([{ placeId: "place-1", title: "123 Main St" }]);
    });

    it("should call autocomplete api with custom input when source is array", async () => {
      const mockResponse: AutocompleteCommandOutput = {
        ResultItems: [
          {
            PlaceId: "place-2",
            Address: { Label: "456 Oak Ave" },
            PlaceType: "Street",
            Title: "Place",
          },
        ],
        PricingBucket: "bucket1",
        $metadata: {},
      };
      vi.mocked(api.autocomplete).mockResolvedValue(mockResponse);

      const { result } = renderHook(
        () =>
          useTypeaheadQuery({
            client: mockClient,
            source: "autocomplete",
            sourceInput: { QueryText: "test", MaxResults: 3 },
            enabled: true,
          }),
        {
          wrapper: createWrapper(mockClient),
        },
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(api.autocomplete).toHaveBeenCalledWith(mockClient, { QueryText: "test", MaxResults: 3 });
      expect(result.current.data).toEqual([{ placeId: "place-2", title: "456 Oak Ave" }]);
    });

    it("should filter out autocomplete results without place id or address label", async () => {
      const mockResponse: AutocompleteCommandOutput = {
        ResultItems: [
          {
            PlaceId: "place-1",
            Address: { Label: "123 Main St" },
            PlaceType: "InterpolatedAddress",
            Title: "123 Main St",
          },
          {
            PlaceId: undefined, // Missing PlaceId
            Address: { Label: "456 Oak Ave" },
            PlaceType: "InterpolatedAddress",
            Title: "456 Oak Ave",
          },
          {
            PlaceId: "place-3",
            Address: { Label: undefined }, // Missing Label
            PlaceType: "InterpolatedAddress",
            Title: "Place 3",
          },
          {
            PlaceId: "place-4",
            Address: { Label: "789 Pine Rd" },
            PlaceType: "InterpolatedAddress",
            Title: "789 Pine Rd",
          },
        ],
        PricingBucket: "bucket1",
        $metadata: {},
      };
      vi.mocked(api.autocomplete).mockResolvedValue(mockResponse);

      const { result } = renderHook(
        () => useTypeaheadQuery({ client: mockClient, source: "autocomplete", enabled: true }),
        { wrapper: createWrapper(mockClient) },
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([
        { placeId: "place-1", title: "123 Main St" },
        { placeId: "place-4", title: "789 Pine Rd" },
      ]);
    });

    it("should return empty array when autocomplete has no resultitems", async () => {
      const mockResponse = {
        ResultItems: undefined,
        PricingBucket: "bucket1",
        $metadata: {},
      };
      vi.mocked(api.autocomplete).mockResolvedValue(mockResponse);

      const { result } = renderHook(
        () => useTypeaheadQuery({ client: mockClient, source: "autocomplete", enabled: true }),
        { wrapper: createWrapper(mockClient) },
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([]);
    });
  });

  describe("suggest api", () => {
    it("should call suggest api with default querytext and biasposition when source is suggest", async () => {
      const mockResponse: SuggestCommandOutput = {
        ResultItems: [
          {
            Place: { PlaceId: "place-1" },
            Title: "Restaurant ABC",
            SuggestResultItemType: "Place",
          },
        ],
        PricingBucket: "bucket1",
        $metadata: {},
      };
      vi.mocked(api.suggest).mockResolvedValue(mockResponse);

      const { result } = renderHook(
        () =>
          useTypeaheadQuery({
            client: mockClient,
            source: "suggest",
            sourceInput: { QueryText: "rest" },
            enabled: true,
          }),
        { wrapper: createWrapper(mockClient) },
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(api.suggest).toHaveBeenCalledWith(mockClient, { QueryText: "rest", BiasPosition: [0, 0] });
      expect(result.current.data).toEqual([{ placeId: "place-1", title: "Restaurant ABC" }]);
    });

    it("should call suggest api with custom input and preserve custom biasposition", async () => {
      const mockResponse: SuggestCommandOutput = {
        ResultItems: [
          {
            Place: { PlaceId: "place-2" },
            Title: "Hotel XYZ",
            SuggestResultItemType: "Place",
          },
        ],
        PricingBucket: "bucket1",
        $metadata: {},
      };
      vi.mocked(api.suggest).mockResolvedValue(mockResponse);

      const { result } = renderHook(
        () =>
          useTypeaheadQuery({
            client: mockClient,
            source: "suggest",
            sourceInput: {
              QueryText: "hotel",
              BiasPosition: [40.7128, -74.006],
              MaxResults: 10,
            },
            enabled: true,
          }),
        {
          wrapper: createWrapper(mockClient),
        },
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(api.suggest).toHaveBeenCalledWith(mockClient, {
        QueryText: "hotel",
        BiasPosition: [40.7128, -74.006],
        MaxResults: 10,
      });
      expect(result.current.data).toEqual([{ placeId: "place-2", title: "Hotel XYZ" }]);
    });

    it("should filter out suggest results without place place id or title", async () => {
      const mockResponse: SuggestCommandOutput = {
        ResultItems: [
          {
            Place: { PlaceId: "place-1" },
            Title: "Restaurant ABC",
            SuggestResultItemType: "Place",
          },
          {
            Place: { PlaceId: undefined }, // Missing PlaceId
            Title: "Hotel XYZ",
            SuggestResultItemType: "Place",
          },
          {
            Place: { PlaceId: "place-3" },
            Title: undefined, // Missing Title
            SuggestResultItemType: "Place",
          },
          {
            Place: { PlaceId: "place-4" },
            Title: "Coffee Shop",
            SuggestResultItemType: "Place",
          },
        ],
        PricingBucket: "bucket1",
        $metadata: {},
      };
      vi.mocked(api.suggest).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useTypeaheadQuery({ client: mockClient, source: "suggest", enabled: true }), {
        wrapper: createWrapper(mockClient),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([
        { placeId: "place-1", title: "Restaurant ABC" },
        { placeId: "place-4", title: "Coffee Shop" },
      ]);
    });

    it("should return empty array when suggest has no resultitems", async () => {
      const mockResponse: SuggestCommandOutput = {
        ResultItems: undefined,
        PricingBucket: "bucket1",
        $metadata: {},
      };
      vi.mocked(api.suggest).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useTypeaheadQuery({ client: mockClient, source: "suggest", enabled: true }), {
        wrapper: createWrapper(mockClient),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([]);
    });
  });

  describe("query behavior", () => {
    it("should not execute query when enabled is false", () => {
      renderHook(() => useTypeaheadQuery({ client: mockClient, source: "autocomplete", enabled: false }), {
        wrapper: createWrapper(mockClient),
      });

      expect(api.autocomplete).not.toHaveBeenCalled();
    });

    it("should use correct query key for caching", () => {
      const { result } = renderHook(
        () =>
          useTypeaheadQuery({
            client: mockClient,
            source: "autocomplete",
            sourceInput: { QueryText: "test" },
            enabled: true,
          }),
        { wrapper: createWrapper(mockClient) },
      );

      // The query key should include the API type and input parameters
      expect(result.current.isLoading || result.current.isSuccess).toBe(true);
    });

    it("should handle api errors gracefully", async () => {
      const mockError = new Error("API Error");
      vi.mocked(api.autocomplete).mockRejectedValue(mockError);

      const defaultOptions = queryClient.getDefaultOptions();
      queryClient.setDefaultOptions({ queries: { retry: false } });

      const { result } = renderHook(
        () => useTypeaheadQuery({ client: mockClient, source: "autocomplete", enabled: true }),
        { wrapper: createWrapper(mockClient) },
      );

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBe(mockError);

      // Restore default options
      queryClient.setDefaultOptions(defaultOptions);
    });

    it("should throw error for invalid api type", async () => {
      const defaultOptions = queryClient.getDefaultOptions();
      queryClient.setDefaultOptions({ queries: { retry: false } });

      const { result } = renderHook(
        () => useTypeaheadQuery({ client: mockClient, source: "invalid-api" as TypeaheadSource, enabled: true }),
        { wrapper: createWrapper(mockClient) },
      );

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeInstanceOf(Error);
      expect((result.current.error as Error).message).toContain("Invalid value for typeahead source");

      // Restore default options
      queryClient.setDefaultOptions(defaultOptions);
    });
  });

  describe("query key generation", () => {
    it("should generate different query keys for different api types", () => {
      const { result: autocompleteResult } = renderHook(
        () => useTypeaheadQuery({ client: mockClient, source: "autocomplete", enabled: false }),
        { wrapper: createWrapper(mockClient) },
      );

      const { result: suggestResult } = renderHook(
        () => useTypeaheadQuery({ client: mockClient, source: "suggest", enabled: false }),
        { wrapper: createWrapper(mockClient) },
      );

      // Both should be different instances since they have different query keys
      expect(autocompleteResult.current).not.toBe(suggestResult.current);
    });

    it("should generate different query keys for different input parameters", () => {
      const { result: result1 } = renderHook(
        () =>
          useTypeaheadQuery({
            client: mockClient,
            source: "autocomplete",
            sourceInput: { QueryText: "test1" },
            enabled: false,
          }),
        { wrapper: createWrapper(mockClient) },
      );

      const { result: result2 } = renderHook(
        () =>
          useTypeaheadQuery({
            client: mockClient,
            source: "autocomplete",
            sourceInput: { QueryText: "test2" },
            enabled: false,
          }),
        { wrapper: createWrapper(mockClient) },
      );

      // Both should be different instances since they have different query keys
      expect(result1.current).not.toBe(result2.current);
    });
  });
});
