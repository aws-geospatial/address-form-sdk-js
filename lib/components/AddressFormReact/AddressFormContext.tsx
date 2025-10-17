import { AutocompleteFilterPlaceType } from "@aws-sdk/client-geo-places";
import { createContext, useContext } from "react";
import { AddressFormData } from "../AddressForm";

export interface MapViewState {
  longitude: number;
  latitude: number;
  zoom: number;
}

export interface AddressFormContextType {
  apiKey: string;
  region: string;
  data: AddressFormData;
  setData: (data: AddressFormData) => void;
  mapViewState?: MapViewState;
  setMapViewState: (mapViewState: MapViewState) => void;
  language?: string;
  politicalView?: string;
  showCurrentCountryResultsOnly?: boolean;
  allowedCountries?: string[];
  placeTypes?: AutocompleteFilterPlaceType[];
}

export const AddressFormContext = createContext<AddressFormContextType | undefined>(undefined);

export const useAddressFormContext = () => {
  const context = useContext(AddressFormContext);

  if (!context) {
    throw new Error("Address form context is not initialized.");
  }

  return context;
};
