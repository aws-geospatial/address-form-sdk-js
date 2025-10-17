import type { AutocompleteFilterPlaceType } from "@aws-sdk/client-geo-places";
import clsx from "clsx";
import { ComponentProps, FormEventHandler, useState } from "react";
import type { Config } from "../../types/config.ts";
import { getIncludeCountriesFilter } from "../../utils/country-filter.ts";
import { Button } from "../Button";
import { CountrySelect } from "../CountrySelect/index.tsx";
import { FormField } from "../FormField";
import { Input } from "../Input";
import { Map, MapProps, MapStyle } from "../Map";
import { MapMarker, MapMarkerProps } from "../MapMarker/index.tsx";
import { Typeahead, TypeaheadOutput, TypeaheadProps } from "../Typeahead";
import { TypeaheadSource } from "../Typeahead/use-typeahead-query.ts";
import * as styles from "./styles.css.ts";
import { positionToString } from "../../utils/position.ts";
import { countries } from "../../main.tsx";

export const FormFieldID = {
  ADDRESS_LINE_ONE: "aws-address-line-one",
  ADDRESS_LINE_TWO: "aws-address-line-two",
  CITY: "aws-city",
  PROVINCE: "aws-province",
  POSTAL_CODE: "aws-postal-code",
  COUNTRY: "aws-country",
  ADJUSTED_POSITION: "aws-adjusted-position",
} as const;

export type FormFieldID = (typeof FormFieldID)[keyof typeof FormFieldID];

export interface AddressFormData {
  addressLineOne?: string;
  addressLineTwo?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
  originalPosition?: string;
  adjustedPosition?: string;
}

export type AddressFormField = {
  id: FormFieldID;
  name: keyof AddressFormData;
  label: string;
  placeholder?: string;
};

export const defaultAddressFormFields: AddressFormField[] = [
  {
    id: FormFieldID.ADDRESS_LINE_ONE,
    name: "addressLineOne",
    label: "Address",
    placeholder: "Enter address",
  },
  {
    id: FormFieldID.ADDRESS_LINE_TWO,
    name: "addressLineTwo",
    label: "Address Line 2",
    placeholder: "Apartment, suite, etc.",
  },
  {
    id: FormFieldID.CITY,
    name: "city",
    label: "City",
  },
  {
    id: FormFieldID.PROVINCE,
    name: "province",
    label: "Province/State",
  },
  {
    id: FormFieldID.POSTAL_CODE,
    name: "postalCode",
    label: "Postal/Zip code",
  },
  {
    id: FormFieldID.COUNTRY,
    name: "country",
    label: "Country",
  },
];

export interface AddressFormProps {
  onSubmit?: (data: AddressFormData) => void;
  fields: AddressFormField[];
  typeahead: Config<
    TypeaheadProps,
    {
      source: TypeaheadSource | null;
      showCurrentLocation?: boolean;
      showCurrentCountryResultsOnly?: boolean;
      placeTypes?: Array<AutocompleteFilterPlaceType>;
      allowedCountries?: string[];
    }
  >;
  map?: Config<
    AddressFormMapProps,
    {
      mapStyle?: MapStyle;
      position?: "right" | "left";
      showAdjustPosition?: boolean;
      hide?: boolean;
      center?: number[];
    }
  >;
  className?: string;
  language?: string;
  politicalView?: string;
}

export function AddressForm({
  fields = defaultAddressFormFields,
  typeahead,
  map,
  politicalView,
  language,
  className = "",
  onSubmit,
}: AddressFormProps) {
  const AddressFormMapComponent = map?.component ?? AddressFormMap;
  const TypeaheadComponent = typeahead?.component ?? Typeahead;

  const [typeaheadValue, setTypeaheadValue] = useState("");

  const getDefaultCenter = () => {
    if (map?.center) {
      return map.center;
    }

    if (typeahead.allowedCountries?.length === 1) {
      return countries.find((country) => country.code === typeahead.allowedCountries?.[0])?.position;
    }
  };

  const [viewState, setViewState] = useState(() => {
    const center = getDefaultCenter();
    return { longitude: center?.[0] ?? -100, latitude: center?.[1] ?? 50, zoom: center ? 5 : 1 };
  });

  const [markerPosition, setMarkerPosition] = useState<[number, number]>();
  const [formState, setFormState] = useState<Partial<AddressFormData>>({});

  const handleFormSubmit: FormEventHandler = (e) => {
    e.preventDefault();

    onSubmit?.({
      addressLineOne: formState.addressLineOne ?? "",
      addressLineTwo: formState.addressLineTwo ?? "",
      city: formState.city ?? "",
      province: formState.province ?? "",
      postalCode: formState.postalCode ?? "",
      country: formState.country ?? "",
      originalPosition: formState.originalPosition ?? "",
      adjustedPosition: formState.adjustedPosition ?? "",
    });
  };

  const handleTypeaheadSelect = (value: TypeaheadOutput) => {
    setFormState((state) => ({
      ...state,
      addressLineOne: value.addressLineOneField,
    }));

    // Only updating these fields if they're address information from API call
    if (!value.fullAddress) {
      return;
    }

    setFormState((state) => ({
      ...state,
      city: value.fullAddress?.Locality,
      postalCode: value.fullAddress?.PostalCode,
      province: value.fullAddress?.Region?.Name,
      country: value.fullAddress?.Country?.Code2,
      originalPosition: value.position ? positionToString(value.position) : "",
    }));

    // Draw marker on map
    if (value.position) {
      setViewState({ longitude: value.position?.[0], latitude: value.position?.[1], zoom: 15 });
      setMarkerPosition([value.position?.[0], value.position?.[1]]);
    }
  };

  const handleResetFields = () => {
    setTypeaheadValue("");
    setMarkerPosition(undefined);
    setFormState({});
  };

  const handleSaveMarkerPosition = (position: [number, number]) => {
    setFormState((state) => ({
      ...state,
      adjustedPosition: positionToString(position),
    }));

    setMarkerPosition(position);
  };

  const register = (name: keyof AddressFormData): ComponentProps<"input"> => {
    return {
      value: formState[name],
      onChange: (e) => setFormState((state) => ({ ...state, [name]: e.target.value })),
    };
  };

  return (
    <div className={clsx(className, styles.base, map?.position === "left" && styles.reversed)}>
      <form className={styles.form} onSubmit={handleFormSubmit}>
        <div className={styles.formElements}>
          {fields.map((config) => {
            return (
              <FormField key={config.id} label={config.label} id={config.id}>
                {config.id === FormFieldID.ADDRESS_LINE_ONE ? (
                  <TypeaheadComponent
                    id={config.id}
                    name={config.id}
                    value={typeaheadValue}
                    onChange={setTypeaheadValue}
                    onSelect={handleTypeaheadSelect}
                    placeholder={config.placeholder}
                    showCurrentLocation={typeahead.showCurrentLocation}
                    source={typeahead.source}
                    sourceInput={{
                      PoliticalView: politicalView,
                      Language: language,
                      BiasPosition: [viewState.longitude, viewState.latitude],
                      Filter: {
                        ...(typeahead.placeTypes &&
                          typeahead.placeTypes.length > 0 && {
                            IncludePlaceTypes: typeahead.placeTypes,
                          }),
                        IncludeCountries: getIncludeCountriesFilter(
                          typeahead.showCurrentCountryResultsOnly,
                          formState.country,
                          typeahead.allowedCountries,
                        ),
                      },
                    }}
                    debounce={300}
                    {...typeahead.props}
                  />
                ) : config.id === FormFieldID.COUNTRY ? (
                  <CountrySelect
                    id={config.id}
                    value={formState.country ?? null}
                    onChange={(country) => setFormState((state) => ({ ...state, country: country ?? undefined }))}
                    allowedCountries={typeahead.allowedCountries}
                  />
                ) : (
                  <Input
                    id={config.id}
                    data-testid={config.id}
                    {...register(config.name)}
                    placeholder={config.placeholder}
                    value={formState[config.name]}
                  />
                )}
              </FormField>
            );
          })}

          <Input
            type="hidden"
            id={FormFieldID.ADJUSTED_POSITION}
            data-testid={FormFieldID.ADJUSTED_POSITION}
            {...register("adjustedPosition")}
            readOnly
          />

          <div className={styles.formButtons}>
            <Button type="submit">Submit</Button>

            <Button variant="secondary" onClick={handleResetFields}>
              Reset
            </Button>
          </div>
        </div>
      </form>

      {map?.hide ? null : (
        <AddressFormMapComponent
          {...viewState}
          mapStyle={map?.mapStyle}
          onMove={(evt) => setViewState(evt.viewState)}
          style={{ width: "50%", aspectRatio: "1/1" }}
          politicalView={politicalView}
          markerPosition={markerPosition}
          onSaveMarkerPosition={handleSaveMarkerPosition}
          adjustablePosition={map?.showAdjustPosition ?? true}
          {...map?.props}
        />
      )}
    </div>
  );
}

export type AddressFormMapProps = MapProps & MapMarkerProps;

export const AddressFormMap = ({
  adjustablePosition,
  markerPosition,
  onSaveMarkerPosition,
  ...mapProps
}: AddressFormMapProps) => {
  return (
    <Map {...mapProps}>
      <MapMarker
        adjustablePosition={adjustablePosition}
        markerPosition={markerPosition}
        onSaveMarkerPosition={onSaveMarkerPosition}
      />
    </Map>
  );
};
