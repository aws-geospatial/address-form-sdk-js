import { describe, it, expect, vi, beforeEach } from "vitest";
import { initializeAwsSdkClient, autocomplete, suggest, getPlace, authHelper, reverseGeocode } from "./api";
import {
  GeoPlacesClient,
  AutocompleteCommand,
  SuggestCommand,
  GetPlaceCommand,
  ReverseGeocodeCommand,
} from "@aws-sdk/client-geo-places";
import { withAPIKey } from "@aws/amazon-location-utilities-auth-helper";

vi.mock("@aws-sdk/client-geo-places", () => {
  return {
    GeoPlacesClient: vi.fn(() => ({
      send: vi.fn(),
    })),
    AutocompleteCommand: vi.fn(),
    SuggestCommand: vi.fn(),
    GetPlaceCommand: vi.fn(),
    ReverseGeocodeCommand: vi.fn(),
  };
});

vi.mock("@aws/amazon-location-utilities-auth-helper", () => {
  return {
    withAPIKey: vi.fn(() => ({
      getClientConfig: vi.fn(() => ({ region: "us-east-1" })),
    })),
  };
});

describe("API", () => {
  const mockApiKey = "test-api-key";
  const mockRegion = "us-east-1";
  let client: GeoPlacesClient;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("initializeAwsSdkClient", () => {
    it("should initialize authHelper with the provided API key and region", () => {
      client = initializeAwsSdkClient(mockApiKey, mockRegion);
      expect(withAPIKey).toHaveBeenCalledWith(mockApiKey, mockRegion);
      expect(authHelper).toBeDefined();
    });

    it("should create a new GeoPlacesClient with the auth helper config", () => {
      client = initializeAwsSdkClient(mockApiKey, mockRegion);
      expect(GeoPlacesClient).toHaveBeenCalledWith(expect.objectContaining({ region: mockRegion }));
      expect(client).toBeDefined();
    });
  });

  describe("autocomplete", () => {
    const mockInput = { QueryText: "test query" };
    const mockResponse = { ResultItems: [] };

    it("should make an Autocomplete request and return the response", async () => {
      client = initializeAwsSdkClient(mockApiKey, mockRegion);
      const mockCommand = {};
      vi.mocked(AutocompleteCommand).mockReturnValueOnce(mockCommand as AutocompleteCommand);
      vi.mocked(client.send).mockResolvedValueOnce(mockResponse as unknown as void);
      const result = await autocomplete(client, mockInput);
      expect(AutocompleteCommand).toHaveBeenCalledWith(mockInput);
      expect(client.send).toHaveBeenCalledWith(mockCommand);
      expect(result).toEqual(mockResponse);
    });

    it("should propagate errors from the Autocomplete request", async () => {
      client = initializeAwsSdkClient(mockApiKey, mockRegion);
      const mockError = new Error("API error");
      vi.mocked(client.send).mockRejectedValueOnce(mockError);
      await expect(autocomplete(client, mockInput)).rejects.toThrow("API error");
    });
  });

  describe("suggest", () => {
    const mockInput = { QueryText: "test query" };
    const mockResponse = { ResultItems: [] };

    it("should make an Suggest request and return the response", async () => {
      client = initializeAwsSdkClient(mockApiKey, mockRegion);
      const mockCommand = {};
      vi.mocked(SuggestCommand).mockReturnValueOnce(mockCommand as SuggestCommand);
      vi.mocked(client.send).mockResolvedValueOnce(mockResponse as unknown as void);
      const result = await suggest(client, mockInput);
      expect(SuggestCommand).toHaveBeenCalledWith(mockInput);
      expect(client.send).toHaveBeenCalledWith(mockCommand);
      expect(result).toEqual(mockResponse);
    });

    it("should propagate errors from the Suggest request", async () => {
      client = initializeAwsSdkClient(mockApiKey, mockRegion);
      const mockError = new Error("API error");
      vi.mocked(client.send).mockRejectedValueOnce(mockError);
      await expect(suggest(client, mockInput)).rejects.toThrow("API error");
    });
  });

  describe("getPlace", () => {
    const mockInput = { PlaceId: "test-place-id" };
    const mockResponse = { Place: { Label: "Test Place" } };

    it("should make an GetPlace request and return the response", async () => {
      client = initializeAwsSdkClient(mockApiKey, mockRegion);
      const mockCommand = {};
      vi.mocked(GetPlaceCommand).mockReturnValueOnce(mockCommand as GetPlaceCommand);
      vi.mocked(client.send).mockResolvedValueOnce(mockResponse as unknown as void);
      const result = await getPlace(client, mockInput);
      expect(GetPlaceCommand).toHaveBeenCalledWith(mockInput);
      expect(client.send).toHaveBeenCalledWith(mockCommand);
      expect(result).toEqual(mockResponse);
    });

    it("should propagate errors from the GetPlace request", async () => {
      client = initializeAwsSdkClient(mockApiKey, mockRegion);
      const mockError = new Error("API error");
      vi.mocked(client.send).mockRejectedValueOnce(mockError);
      await expect(getPlace(client, mockInput)).rejects.toThrow("API error");
    });
  });

  describe("reverseGeocode", () => {
    const mockInput = { QueryPosition: [0, 0] };
    const mockResponse = { ResultItems: [] };

    it("should make an ReverseGeocode request and return the response", async () => {
      client = initializeAwsSdkClient(mockApiKey, mockRegion);
      const mockCommand = {};
      vi.mocked(ReverseGeocodeCommand).mockReturnValueOnce(mockCommand as ReverseGeocodeCommand);
      vi.mocked(client.send).mockResolvedValueOnce(mockResponse as unknown as void);
      const result = await reverseGeocode(client, mockInput);
      expect(ReverseGeocodeCommand).toHaveBeenCalledWith(mockInput);
      expect(client.send).toHaveBeenCalledWith(mockCommand);
      expect(result).toEqual(mockResponse);
    });

    it("should propagate errors from the ReverseGeocode request", async () => {
      client = initializeAwsSdkClient(mockApiKey, mockRegion);
      const mockError = new Error("API error");
      vi.mocked(client.send).mockRejectedValueOnce(mockError);
      await expect(reverseGeocode(client, mockInput)).rejects.toThrow("API error");
    });
  });
});
