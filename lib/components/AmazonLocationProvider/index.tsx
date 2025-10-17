import { QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren, useMemo } from "react";
import AmazonLocationContext from "../../context/amazon-location-context";
import { initializeAwsSdkClient } from "../../utils/api";
import { queryClient } from "../../utils/query-client";
import { GeoPlacesClient } from "@aws-sdk/client-geo-places";
type AmazonLocationProviderProps = PropsWithChildren & { apiKey: string; region: string; client?: GeoPlacesClient };

export function AmazonLocationProvider({ apiKey, region, children, client }: AmazonLocationProviderProps) {
  const value = useMemo(() => {
    if (!apiKey || !region) {
      throw new Error("Please provide both `apiKey` and `region` props to <AmazonLocationProvider> component.");
    }
    return {
      apiKey,
      region,
      client: client || initializeAwsSdkClient(apiKey, region),
    };
  }, [apiKey, region, client]);

  return (
    <AmazonLocationContext.Provider value={value}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </AmazonLocationContext.Provider>
  );
}
