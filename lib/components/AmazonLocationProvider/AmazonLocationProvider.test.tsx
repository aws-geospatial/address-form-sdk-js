import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AmazonLocationProvider } from ".";
import * as api from "../../utils/api";

vi.mock("../../utils/api", () => ({
  initializeAwsSdkClient: vi.fn(),
}));

describe("AmazonLocationProvider Component", () => {
  it("should initialize AWS SDK client on mount", () => {
    render(<AmazonLocationProvider apiKey="test-api-key" region="us-west-2" />);

    expect(api.initializeAwsSdkClient).toHaveBeenCalledWith("test-api-key", "us-west-2");
  });

  it("should throw an error when apiKey is not provided", () => {
    expect(() => render(<AmazonLocationProvider apiKey="" region="us-east-1" />)).toThrow(
      "Please provide both `apiKey` and `region` props to <AmazonLocationProvider> component.",
    );
  });

  it("should throw an error when region is not provided", () => {
    expect(() => render(<AmazonLocationProvider apiKey="test-api-key" region="" />)).toThrow(
      "Please provide both `apiKey` and `region` props to <AmazonLocationProvider> component.",
    );
  });
});
