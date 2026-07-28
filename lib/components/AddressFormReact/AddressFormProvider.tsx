import { AutocompleteFilterPlaceType, GeoPlacesClient } from "@aws-sdk/client-geo-places";
import { FunctionComponent, PropsWithChildren, useMemo, useState } from "react";
import type { AddressFormData } from "./AddressForm";
import { AddressFormContext, AddressFormContextType, MapViewState } from "./AddressFormContext";
import { parsePosition } from "./utils";
import { TypeaheadAPIName } from "../Typeahead/use-typeahead-query";
import { AmazonLocationProvider } from "../AmazonLocationProvider";
import { countries } from "../../data/countries";
import { isCenterWithinBounds, type CenterBounds } from "../../utils/bounds";

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
  centerBounds?: CenterBounds;
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
  centerBounds,
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

  // Stabilize the bounds reference so an inline array literal from the consumer doesn't
  // change identity on every render — that would rebuild the context object every render
  // and retrigger context-dependent effects (e.g. AddressFormAddressField's setTypeaheadApiName)
  // in a loop. Keyed on the serialized values, so it only changes when the bounds change.
  const centerBoundsKey = centerBounds ? JSON.stringify(centerBounds) : undefined;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stableCenterBounds = useMemo(() => centerBounds, [centerBoundsKey]);

  // Only the user-adjusted pin can carry an out-of-region coordinate into the submitted
  // result — the search bias is always clamped and an out-of-region current location is
  // rejected outright, so originalPosition stays in-region.
  // Derive the flag from adjustedPosition (not the raw center) so it never false-alarms on a
  // fresh, unsearched map. Exposed as a primitive so consumers depend on a stable boolean.
  const isAdjustedPositionOutOfBounds = useMemo(() => {
    const adjusted = parsePosition(data.adjustedPosition ?? "");
    return !!adjusted && !isCenterWithinBounds(adjusted, stableCenterBounds);
  }, [data.adjustedPosition, stableCenterBounds]);

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
      centerBounds: stableCenterBounds,
      isAdjustedPositionOutOfBounds,
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
      stableCenterBounds,
      isAdjustedPositionOutOfBounds,
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
