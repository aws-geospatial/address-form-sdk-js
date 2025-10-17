import { AutocompleteFilterPlaceType } from "@aws-sdk/client-geo-places";
import clsx from "clsx";
import { ComponentProps, FormEvent, FormEventHandler, FunctionComponent, useMemo, useState } from "react";
import { AddressFormData } from "../AddressForm";
import { AddressFormContext, AddressFormContextType, MapViewState } from "./AddressFormContext";
import { AddressFormFields } from "./AddressFormFields";
import { AddressFormMap, AddressFormMapProps } from "./AddressFormMap";
import { AddressFormTextField, AddressFormTextFieldProps } from "./AddressFormTextField";
import * as styles from "./styles.css";
import { AddressFormCountryField, AddressFormCountryFieldProps } from "./AddressFormCountryField";
import { AddressFormAddressField, AddressFormAddressFieldProps } from "./AddressFormAddressField";

interface AddressFormProps extends Omit<ComponentProps<"form">, "onSubmit"> {
  apiKey: string;
  region: string;
  preventDefaultOnSubmit?: boolean;
  language?: string;
  politicalView?: string;
  showCurrentCountryResultsOnly?: boolean;
  allowedCountries?: string[];
  placeTypes?: AutocompleteFilterPlaceType[];
  onSubmit?: (event: FormEvent & { data: AddressFormData }) => void;
}

interface ChildComponents {
  AddressField: FunctionComponent<AddressFormAddressFieldProps>;
  CountryField: FunctionComponent<AddressFormCountryFieldProps>;
  Map: FunctionComponent<AddressFormMapProps>;
  TextField: FunctionComponent<AddressFormTextFieldProps>;
}

export const AddressForm: FunctionComponent<AddressFormProps> & ChildComponents = ({
  apiKey,
  region,
  children,
  className,
  onSubmit,
  language,
  politicalView,
  preventDefaultOnSubmit = true,
  showCurrentCountryResultsOnly,
  allowedCountries,
  placeTypes,
  ...rest
}) => {
  const [data, setData] = useState<AddressFormData>({});
  const [mapViewState, setMapViewState] = useState<MapViewState>();

  const context = useMemo<AddressFormContextType>(
    () => ({
      apiKey,
      region,
      data,
      setData: (data: AddressFormData) => setData((state) => ({ ...state, ...data })),
      mapViewState,
      setMapViewState,
      language,
      politicalView,
      showCurrentCountryResultsOnly,
      allowedCountries,
      placeTypes,
    }),
    [
      allowedCountries,
      apiKey,
      data,
      language,
      mapViewState,
      placeTypes,
      politicalView,
      region,
      showCurrentCountryResultsOnly,
    ],
  );

  const handleSubmit: FormEventHandler = (event) => {
    if (preventDefaultOnSubmit) {
      event.preventDefault();
    }

    onSubmit?.({ ...event, data });
  };

  const handleReset = () => {
    setData({});
  };

  return (
    <AddressFormContext.Provider value={context}>
      <form className={clsx(styles.root, className)} {...rest} onSubmit={handleSubmit} onReset={handleReset}>
        <AddressFormFields>{children}</AddressFormFields>
      </form>
    </AddressFormContext.Provider>
  );
};

AddressForm.AddressField = AddressFormAddressField;
AddressForm.CountryField = AddressFormCountryField;
AddressForm.Map = AddressFormMap;
AddressForm.TextField = AddressFormTextField;
