import {
  Address,
  AutocompleteFilterPlaceType,
  GeoPlacesClient,
  type GetPlaceIntendedUse,
} from "@aws-sdk/client-geo-places";
import clsx from "clsx";
import { ComponentProps, FormEventHandler, FunctionComponent, ReactNode, useEffect, useRef, useState } from "react";
import { AddressFormAddressField, AddressFormAddressFieldProps } from "./AddressFormAddressField";
import { AddressFormAutofillHandler } from "./AddressFormAutofillHandler";
import { useAddressFormContext } from "./AddressFormContext";
import { AddressFormCountryField, AddressFormCountryFieldProps } from "./AddressFormCountryField";
import { AddressFormFields } from "./AddressFormFields";
import { AddressFormMap, AddressFormMapProps } from "./AddressFormMap";
import { AddressFormProvider } from "./AddressFormProvider";
import { AddressFormTextField, AddressFormTextFieldProps } from "./AddressFormTextField";
import * as styles from "./styles.css";
import useAmazonLocationContext from "../../hooks/use-amazon-location-context";
import { getPlace } from "../../utils/api";
import { NotificationContainer } from "../Notification";

export interface AddressFormData {
  placeId?: string;
  addressLineOne?: string;
  addressLineTwo?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
  originalPosition?: string;
  adjustedPosition?: string;
  addressDetails?: Address;
}

export interface AddressFormProps extends AddressFormContentProps {
  apiKey?: string;
  region: string;
  client?: GeoPlacesClient;
  language?: string;
  politicalView?: string;
  showCurrentCountryResultsOnly?: boolean;
  allowedCountries?: string[];
  placeTypes?: AutocompleteFilterPlaceType[];
  initialMapCenter?: [number, number];
  initialMapZoom?: number;
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
  client,
  children,
  language,
  politicalView,
  showCurrentCountryResultsOnly,
  allowedCountries,
  placeTypes,
  initialMapCenter,
  initialMapZoom,
  ...contentProps
}) => {
  return (
    <AddressFormProvider
      apiKey={apiKey}
      region={region}
      client={client}
      language={language}
      politicalView={politicalView}
      showCurrentCountryResultsOnly={showCurrentCountryResultsOnly}
      allowedCountries={allowedCountries}
      placeTypes={placeTypes}
      initialMapCenter={initialMapCenter}
      initialMapZoom={initialMapZoom}
    >
      <AddressFormContent {...contentProps}>{children}</AddressFormContent>
    </AddressFormProvider>
  );
};

export type SubmitHandler = (
  getData: (options: { intendedUse: GetPlaceIntendedUse }) => Promise<AddressFormData>,
) => void;

interface AddressFormContentProps extends Omit<ComponentProps<"form">, "onSubmit"> {
  onSubmit?: SubmitHandler;
  className?: string;
  children: ReactNode;
}

const AddressFormContent: FunctionComponent<AddressFormContentProps> = ({ children, className, onSubmit, ...rest }) => {
  const { data, resetData } = useAddressFormContext();
  const { client } = useAmazonLocationContext();
  const formRef = useRef<HTMLFormElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSubmit: FormEventHandler = (event) => {
    event.preventDefault();

    onSubmit?.(async ({ intendedUse }) => {
      // If the user is going to store the results (even for caching purposes),
      // we must make another API call for the same place with the storage option.
      // See: https://docs.aws.amazon.com/location/latest/developerguide/places-intended-use.html
      if (intendedUse === "Storage" && data.placeId) {
        await getPlace(client, { PlaceId: data.placeId, IntendedUse: intendedUse });
      }

      return data;
    });
  };

  return (
    <form ref={formRef} className={clsx(styles.root, className)} {...rest} onSubmit={handleSubmit} onReset={resetData}>
      <NotificationContainer />
      {isMounted && formRef.current && <AddressFormAutofillHandler form={formRef.current} />}
      <AddressFormFields>{children}</AddressFormFields>
    </form>
  );
};

AddressForm.AddressField = AddressFormAddressField;
AddressForm.CountryField = AddressFormCountryField;
AddressForm.Map = AddressFormMap;
AddressForm.TextField = AddressFormTextField;
