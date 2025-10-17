/**
 * Integration test file for API functionality that requires real AWS SDK clients.
 * 
 * This file is separate from api.test.ts because:
 * 1. api.test.ts has extensive mocking of @aws-sdk/client-geo-places and @aws/amazon-location-utilities-auth-helper
 * 2. Testing custom user agent headers requires real AWS SDK client instances with actual middleware stacks
 * 3. Mocked clients don't have the middleware functionality needed to intercept and verify HTTP headers
 * 4. Integration tests need to verify end-to-end behavior without mocking the core SDK functionality
 * 5. Separating allows unit tests (api.test.ts) to remain fast and focused on business logic,
 *    while integration tests verify actual SDK integration behavior
 */

import { describe, it, expect } from "vitest";
import { initializeAwsSdkClient, autocomplete, reverseGeocode } from "./api";
import { GeoPlacesClient } from "@aws-sdk/client-geo-places";

describe("GeoPlaces client's requests should have aws-geo-client-src custom tag in x-amz-user-agent header", () => {
  const mockApiKey = "test-api-key";
  const mockRegion = "us-east-1";

  const testCustomUserAgent = async (apiCall: (client: GeoPlacesClient) => Promise<unknown>) => {
    const client = initializeAwsSdkClient(mockApiKey, mockRegion);
    let capturedRequest: unknown = null;
    
    client.middlewareStack.add(
      () => async (args: { request: unknown }) => {
        capturedRequest = args.request;
        throw new Error("Request captured");
      },
      { step: "finalizeRequest", name: "captureRequest", priority: "high" }
    );

    try {
      await apiCall(client);
    } catch {
      // Expected to fail
    }

    expect(capturedRequest).toBeDefined();
    expect((capturedRequest as { headers: Record<string, string> }).headers['x-amz-user-agent']).toContain('aws-geo-client-src/1.0+AddressForm');
  };

  it("should send autocomplete request with custom user agent", async () => {
    await testCustomUserAgent((client) => autocomplete(client, { QueryText: "test query" }));
  });

  it("should send reverseGeocode request with custom user agent", async () => {
    await testCustomUserAgent((client) => reverseGeocode(client, { QueryPosition: [0, 0] }));
  });
});
