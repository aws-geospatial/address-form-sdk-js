import { AutocompleteFilterPlaceType } from "@aws-sdk/client-geo-places";
import { createContext, useContext } from "react";
import type { AddressFormData } from "./AddressForm";
import { TypeaheadAPIName } from "../Typeahead/use-typeahead-query";

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
