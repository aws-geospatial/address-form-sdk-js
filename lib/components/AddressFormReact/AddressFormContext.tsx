import { AutocompleteFilterPlaceType } from "@aws-sdk/client-geo-places";
import { createContext, useContext } from "react";
import type { AddressFormData } from "./AddressForm";
import { TypeaheadAPIName } from "../Typeahead/use-typeahead-query";
import type { CenterBounds } from "../../utils/bounds";

export interface MapViewState {
  longitude: number;
  latitude: number;
  zoom: number;
}

export interface AddressFormContextType {
  apiKey?: string;
  region: string;
  data: AddressFormData;
  setData: (data: AddressFormData) => void;
  resetData?: () => void;
  mapViewState?: MapViewState;
  setMapViewState: (mapViewState: MapViewState) => void;
  language?: string;
  politicalView?: string;
  showCurrentCountryResultsOnly?: boolean;
  allowedCountries?: string[];
  placeTypes?: AutocompleteFilterPlaceType[];
  // Optional supported-region box. When set, the search bias is clamped into it, an
  // out-of-region current location is reported rather than looked up, and the adjusted pin is
  // kept usable within it (submit is blocked while the pin is outside).
  centerBounds?: CenterBounds;
  // Derived from data.adjustedPosition + centerBounds. True only when the user has dragged the
  // pin to a coordinate outside the region. Exposed as a primitive so consumers depend on a
  // stable boolean rather than the centerBounds array identity.
  isAdjustedPositionOutOfBounds?: boolean;
  isAutofill: boolean;
  setIsAutofill: (isAutofill: boolean) => void;
  typeaheadApiName: TypeaheadAPIName | null;
  setTypeaheadApiName: (typeaheadApiName: TypeaheadAPIName | null) => void;
}

export const AddressFormContext = createContext<AddressFormContextType | undefined>(undefined);

export const useAddressFormContext = () => {
  const context = useContext(AddressFormContext);

  if (!context) {
    throw new Error("Address form context is not initialized.");
  }

  return context;
};
