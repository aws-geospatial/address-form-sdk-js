import { render, RenderOptions } from "@testing-library/react";
import { ReactNode } from "react";
import { AmazonLocationProvider } from "../components/AmazonLocationProvider";
import { vi } from "vitest";
import { GeoPlacesClient } from "@aws-sdk/client-geo-places";

vi.mock("../../utils/api", () => ({
  initializeAwsSdkClient: vi.fn(),
}));

const client = new GeoPlacesClient();

export function renderWithProvider(ui: ReactNode, options?: Omit<RenderOptions, "wrapper">) {
  return render(ui, {
    wrapper: ({ children }) => (
      <AmazonLocationProvider apiKey="test-api-key" region="us-east-1" client={client}>
        {children}
      </AmazonLocationProvider>
    ),
    ...options,
  });
}
