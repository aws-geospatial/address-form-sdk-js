import { AutocompleteFilterPlaceType, GeoPlacesClient } from "@aws-sdk/client-geo-places";
import { FunctionComponent, PropsWithChildren, useMemo, useState } from "react";
import type { AddressFormData } from "./AddressForm";
import { AddressFormContext, AddressFormContextType, MapViewState } from "./AddressFormContext";
import { TypeaheadAPIName } from "../Typeahead/use-typeahead-query";
import { AmazonLocationProvider } from "../AmazonLocationProvider";
import { countries } from "../../data/countries";

export interface AddressFormProps extends PropsWithChildren {
  apiKey?: string;
  region: string;
  language?: string;
  politicalView?: string;
  showCurrentCountryResultsOnly?: boolean;
  allowedCountries?: string[];
  placeTypes?: AutocompleteFilterPlaceType[];
  client?: GeoPlacesClient;
  initialMapCenter?: [number, number];
  initialMapZoom?: number;
}

export const AddressFormProvider: FunctionComponent<AddressFormProps> = ({
  apiKey,
  region,
  children,
  language,
  politicalView,
  showCurrentCountryResultsOnly,
  allowedCountries,
  placeTypes,
  client,
  initialMapCenter,
  initialMapZoom,
}) => {
  const [data, setData] = useState<AddressFormData>({});
  const [isAutofill, setIsAutofill] = useState(false);
  const [mapViewState, setMapViewState] = useState<MapViewState>(() => {
    // If explicit initial values provided, use them
    if (initialMapCenter) {
      return {
        longitude: initialMapCenter[0],
        latitude: initialMapCenter[1],
        zoom: initialMapZoom ?? 10,
      };
    }

    // Fallback: If single country allowed, center on that country
    if (allowedCountries?.length === 1) {
      const country = countries.find((c) => c.code === allowedCountries[0]);
      if (country?.position) {
        return {
          longitude: country.position[0],
          latitude: country.position[1],
          zoom: initialMapZoom ?? 5,
        };
      }
    }

    // Default fallback
    return {
      longitude: 0,
      latitude: 0,
      zoom: initialMapZoom ?? 1,
    };
  });
  const [typeaheadApiName, setTypeaheadApiName] = useState<TypeaheadAPIName | null>(null);

  const context = useMemo<AddressFormContextType>(
    () => ({
      apiKey,
      region,
      data,
      setData: (data: AddressFormData) => setData((state) => ({ ...state, ...data })),
      resetData: () => setData({}),
      mapViewState,
      setMapViewState,
      language,
      politicalView,
      showCurrentCountryResultsOnly,
      allowedCountries,
      placeTypes,
      isAutofill,
      setIsAutofill,
      typeaheadApiName,
      setTypeaheadApiName,
    }),
    [
      apiKey,
      region,
      data,
      mapViewState,
      language,
      politicalView,
      showCurrentCountryResultsOnly,
      allowedCountries,
      placeTypes,
      isAutofill,
      typeaheadApiName,
    ],
  );

  return (
    <AmazonLocationProvider region={region} apiKey={apiKey} client={client}>
      <AddressFormContext.Provider value={context}>{children}</AddressFormContext.Provider>
    </AmazonLocationProvider>
  );
};
