import {
  AutocompleteCommandInput,
  GeoPlacesClient,
  GetPlaceCommandInput,
  ReverseGeocodeCommandInput,
  SuggestCommandInput,
} from "@aws-sdk/client-geo-places";
import { autocomplete, getPlace, reverseGeocode, suggest } from "./api";

export const autocompleteQuery = (client: GeoPlacesClient, input: AutocompleteCommandInput) => {
  return {
    queryKey: ["autocomplete", input],
    queryFn: () => autocomplete(client, input),
  };
};

export const suggestQuery = (client: GeoPlacesClient, input: SuggestCommandInput) => {
  return {
    queryKey: ["suggest", input],
    queryFn: () => suggest(client, input),
  };
};

export const getPlaceQuery = (client: GeoPlacesClient, input: GetPlaceCommandInput) => {
  return {
    queryKey: ["getPlace", input],
    queryFn: () => getPlace(client, input),
  };
};

export const reverseGeocodeQuery = (client: GeoPlacesClient, input: ReverseGeocodeCommandInput) => {
  return {
    queryKey: ["reverseGeocode", input],
    queryFn: () => reverseGeocode(client, input),
  };
};
