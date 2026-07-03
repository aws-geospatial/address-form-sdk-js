import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AmazonLocationProvider } from ".";
import * as api from "../../utils/api";
import { GeoPlacesClient } from "@aws-sdk/client-geo-places";

vi.mock("../../utils/api", () => ({
  initializeAwsSdkClient: vi.fn(),
}));

describe("AmazonLocationProvider Component", () => {
  it("should initialize AWS SDK client on mount when only apiKey is provided", () => {
    render(<AmazonLocationProvider apiKey="test-api-key" region="us-west-2" />);

    expect(api.initializeAwsSdkClient).toHaveBeenCalledWith("test-api-key", "us-west-2");
  });

  it("should not initialize AWS SDK client when a pre-configured client is provided", () => {
    vi.clearAllMocks();
    const client = new GeoPlacesClient();

    render(<AmazonLocationProvider region="us-west-2" client={client} />);

    expect(api.initializeAwsSdkClient).not.toHaveBeenCalled();
  });

  it("should accept a client without an apiKey", () => {
    const client = new GeoPlacesClient();

    expect(() => render(<AmazonLocationProvider region="us-west-2" client={client} />)).not.toThrow();
  });

  it("should throw an error when neither apiKey nor client is provided", () => {
    expect(() => render(<AmazonLocationProvider region="us-east-1" />)).toThrow(
      "Please provide either an `apiKey` or a pre-configured `client` prop.",
    );
  });

  it("should throw an error when region is not provided", () => {
    expect(() => render(<AmazonLocationProvider apiKey="test-api-key" region="" />)).toThrow(
      "Please provide a `region` prop.",
    );
  });
});
