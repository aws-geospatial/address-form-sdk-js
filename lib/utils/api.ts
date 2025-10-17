import {
  GeoPlacesClient,
  AutocompleteCommand,
  SuggestCommand,
  GetPlaceCommand,
  AutocompleteCommandInput,
  AutocompleteCommandOutput,
  SuggestCommandInput,
  SuggestCommandOutput,
  GetPlaceCommandInput,
  GetPlaceCommandOutput,
  ReverseGeocodeCommandInput,
  ReverseGeocodeCommandOutput,
  ReverseGeocodeCommand,
} from "@aws-sdk/client-geo-places";
import { SDKAuthHelper, withAPIKey } from "@aws/amazon-location-utilities-auth-helper";

export let authHelper: SDKAuthHelper;

export const initializeAwsSdkClient = (apiKey: string, region: string) => {
  authHelper = withAPIKey(apiKey, region);
  return new GeoPlacesClient({
    ...authHelper.getClientConfig(),
    customUserAgent: 'aws-geo-client-src/1.0+AddressForm'
  });
};

export const autocomplete = async (
  client: GeoPlacesClient,
  input: AutocompleteCommandInput,
): Promise<AutocompleteCommandOutput> => {
  const command = new AutocompleteCommand(input);
  return await client.send(command);
};

export const suggest = async (client: GeoPlacesClient, input: SuggestCommandInput): Promise<SuggestCommandOutput> => {
  const command = new SuggestCommand(input);
  return await client.send(command);
};

export const getPlace = async (
  client: GeoPlacesClient,
  input: GetPlaceCommandInput,
): Promise<GetPlaceCommandOutput> => {
  const command = new GetPlaceCommand(input);
  return await client.send(command);
};

export const reverseGeocode = async (
  client: GeoPlacesClient,
  input: ReverseGeocodeCommandInput,
): Promise<ReverseGeocodeCommandOutput> => {
  const command = new ReverseGeocodeCommand(input);
  return await client.send(command);
};
