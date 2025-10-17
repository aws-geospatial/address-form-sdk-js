import { memo, useId } from "react";
import { getIncludeCountriesFilter } from "../../main";
import { AddressFormData } from "../AddressForm";
import { FormField } from "../FormField";
import { Typeahead, TypeaheadOutput } from "../Typeahead";
import { TypeaheadSource } from "../Typeahead/use-typeahead-query";
import { useAddressFormContext } from "./AddressFormContext";

export interface AddressFormAddressFieldProps {
  name: keyof AddressFormData;
  label: string;
  showCurrentLocation: boolean;
  apiName: TypeaheadSource | null;
  placeholder?: string;
  className?: string;
}

export const AddressFormAddressField = memo(
  ({ name, label, className, showCurrentLocation, apiName, placeholder }: AddressFormAddressFieldProps) => {
    const context = useAddressFormContext();
    const id = useId();

    const handleTypeaheadSelect = (value: TypeaheadOutput) => {
      context.setData({
        addressLineOne: value.addressLineOneField,
        city: value.fullAddress?.Locality,
        postalCode: value.fullAddress?.PostalCode,
        province: value.fullAddress?.Region?.Name,
        country: value.fullAddress?.Country?.Code2,
        originalPosition: value.position?.join(","),
      });

      if (value.position) {
        const [longitude, latitude] = value.position;
        context.setMapViewState({ longitude, latitude, zoom: 15 });
        context.setData({ originalPosition: [longitude, latitude].join(",") });
      }
    };

    return (
      <FormField id={id} label={label}>
        <Typeahead
          id={id}
          name={name}
          placeholder={placeholder}
          className={className}
          showCurrentLocation={showCurrentLocation}
          source={apiName}
          sourceInput={{
            PoliticalView: context.politicalView,
            Language: context.language,
            BiasPosition: context.mapViewState
              ? [context.mapViewState.longitude, context.mapViewState.latitude]
              : undefined,
            Filter: {
              IncludePlaceTypes: context.placeTypes,
              IncludeCountries: getIncludeCountriesFilter(
                context.showCurrentCountryResultsOnly,
                context.data.country,
                context.allowedCountries,
              ),
            },
          }}
          value={context.data.addressLineOne ?? ""}
          onChange={(addressLineOne) => context.setData({ addressLineOne })}
          onSelect={handleTypeaheadSelect}
        />
      </FormField>
    );
  },
);
