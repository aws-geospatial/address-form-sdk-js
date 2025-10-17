import { createContext } from "react";
import { GeoPlacesClient } from "@aws-sdk/client-geo-places";
const AmazonLocationContext = createContext<
  | {
      apiKey: string;
      region: string;
      client: GeoPlacesClient;
    }
  | undefined
>(undefined);

export default AmazonLocationContext;
