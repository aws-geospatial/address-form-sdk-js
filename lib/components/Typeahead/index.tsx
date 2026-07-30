import { Address } from "@aws-sdk/client-geo-places";
import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from "@headlessui/react";
import { useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { useEffect, useRef } from "react";
import useAmazonLocationContext from "../../hooks/use-amazon-location-context.ts";
import { useDebounce } from "../../utils/debounce.ts";
import { getPlaceQuery } from "../../utils/queries.ts";
import { Input } from "../Input/index.tsx";
import { LocateButton } from "../LocateButton";
import { base, brandOption, brandOptionLink, currentLocation, info, input, option, options } from "./styles.css.ts";
import { TypeaheadAPIInput, TypeaheadAPIName, TypeaheadResultItem, useTypeaheadQuery } from "./use-typeahead-query.ts";
import { countries } from "../../data/countries.ts";
import type { CenterBounds } from "../../utils/bounds.ts";

export interface TypeaheadOutput {
  placeId?: string;
  addressLineOneField?: string;
  addressLineTwoField?: string;
  fullAddress?: Address;
  position?: [number, number];
}

export interface TypeaheadProps {
  id?: string;
  name?: string;
  placeholder?: string;
  className?: string;
  apiName: TypeaheadAPIName | null;
  apiInput?: TypeaheadAPIInput;
  value: string;
  onChange: (value: string) => void;
  onSelect: (value: TypeaheadOutput) => void;
  showCurrentLocation?: boolean;
  debounce?: number;
  skipNextQuery?: boolean;
  // Optional supported-region box; forwarded to the current-location button, which warns
  // instead of looking up a device outside it.
  queryBounds?: CenterBounds;
}

export const Typeahead = ({ apiName, ...props }: TypeaheadProps) => {
  return apiName ? <APITypeahead {...props} apiName={apiName} /> : <InputTypeahead {...props} apiName={null} />;
};

const APITypeahead = ({
  id,
  name,
  placeholder,
  className,
  value,
  onChange,
  apiName,
  apiInput,
  onSelect,
  showCurrentLocation = true,
  debounce = 300,
  skipNextQuery,
  queryBounds,
}: TypeaheadProps & { apiName: TypeaheadAPIName }) => {
  const debouncedValue = useDebounce(value, debounce);
  const { client } = useAmazonLocationContext();
  const queryClient = useQueryClient();
  const isValid = debouncedValue.length >= 2;
  const skipNextQueryRef = useRef(false);
  const currentBiasPosition = apiInput?.BiasPosition?.join(","); // Used for tracking map view changes

  useEffect(() => {
    if (skipNextQuery !== undefined) {
      skipNextQueryRef.current = skipNextQuery;
    }
  }, [skipNextQueryRef, skipNextQuery]);

  // Clear typeahead cache on map view change to avoid displaying stale results
  useEffect(() => {
    if (currentBiasPosition) {
      skipNextQueryRef.current = true; // Prevents API call bursts on map view changes by disabling the active query
      queryClient.invalidateQueries({ queryKey: ["typeahead"] });
    }
  }, [currentBiasPosition, queryClient]);

  const {
    data = [],
    isLoading,
    isError,
  } = useTypeaheadQuery({
    client,
    apiName,
    apiInput: { QueryText: debouncedValue, MaxResults: 5, ...apiInput },
    enabled: isValid && !skipNextQueryRef.current,
  });

  /**
   * Handles input value changes and controls typeahead query execution
   * @param value - The new input value
   * @param silent - When true, skips typeahead API calls (used for programmatic updates)
   */
  const handleChange = (value: string, silent = false) => {
    skipNextQueryRef.current = silent;
    onChange(value);
  };

  const handleAddressSelect = async (address: TypeaheadResultItem | null) => {
    if (!address) {
      return;
    }

    const result = await queryClient.ensureQueryData(
      getPlaceQuery(client, {
        PlaceId: address.placeId,
        Language: apiInput?.Language,
        PoliticalView: apiInput?.PoliticalView,
      }),
    );

    const [lng, lat] = result.Position ?? [];

    const matchedCountry = countries.find((country) => country.code === result.Address?.Country?.Code2);
    const addressLineOneFallback = result.Address?.Label || address.title;

    const addressLineOneField = matchedCountry?.supported
      ? [result.Address?.AddressNumber, result.Address?.Street].filter(Boolean).join(" ") || addressLineOneFallback
      : addressLineOneFallback;

    handleChange(addressLineOneField, true);

    onSelect({
      placeId: result.PlaceId,
      addressLineOneField,
      addressLineTwoField: result.PlaceType === "PointOfInterest" ? result.Title : undefined,
      fullAddress: result.Address,
      position: result.Position ? [lng, lat] : undefined,
    });

    // The user selected an address, we can clear the cache without refetching
    queryClient.removeQueries({ queryKey: ["typeahead"] });
    queryClient.removeQueries({ queryKey: ["getPlace"] });
  };

  useEffect(() => {
    if (value.length > 1) {
      // Remove leading space added in onClose to trigger re-render for autofilled values
      onChange(value.trimStart());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Removed: `onChange`
  }, [value]);

  const handleCurrentLocation = (address: TypeaheadOutput) => {
    handleChange(address.addressLineOneField ?? "", true);
    onSelect(address);
  };

  return (
    <div className={clsx(className, base)}>
      <Combobox
        onChange={handleAddressSelect}
        onClose={() => {
          if (value) {
            // Prepend space to trigger re-render since Combobox doesn't handle autofilled values without user interaction
            onChange(` ${value}`);
          }
        }}
      >
        <ComboboxInput
          as={Input}
          id={id}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={(event) => handleChange(event.target.value)}
          className={input}
          autoComplete="off"
        />

        {isValid && (
          <ComboboxOptions
            transition
            anchor="bottom start"
            className={clsx(options, "aws-typeahead-results")}
            data-testid={`aws-typeahead-results-${apiName}`}
            modal={false}
          >
            {isLoading && !isError && (
              <ComboboxOption value={null} className={clsx(info, "aws-typeahead-results__loading")} disabled>
                Loading...
              </ComboboxOption>
            )}

            {data.length === 0 && !isLoading && !isError && (
              <ComboboxOption value={null} className={clsx(info, "aws-typeahead-results__no-results")} disabled>
                No results.
              </ComboboxOption>
            )}

            {isError && (
              <ComboboxOption value={null} className={clsx(info, "aws-typeahead-results__no-results")} disabled>
                Unable to fetch results.
              </ComboboxOption>
            )}

            {data.map((results) => (
              <ComboboxOption
                key={results.placeId}
                value={results}
                className={clsx(option, "aws-typeahead-results__option")}
              >
                {results.title}
              </ComboboxOption>
            ))}

            <ComboboxOption value={null} className={clsx(brandOption, "aws-typeahead-results__brand")} disabled>
              <a className={brandOptionLink} href="https://aws.amazon.com/location/" target="_blank" rel="noreferrer">
                Powered by Amazon Location
              </a>
            </ComboboxOption>
          </ComboboxOptions>
        )}
      </Combobox>

      {showCurrentLocation && (
        <LocateButton onLocate={handleCurrentLocation} className={currentLocation} queryBounds={queryBounds} />
      )}
    </div>
  );
};

const InputTypeahead = ({
  id,
  name,
  placeholder,
  className,
  value,
  onChange,
  onSelect,
  showCurrentLocation = true,
  queryBounds,
}: TypeaheadProps) => {
  const handleCurrentLocation = (address: TypeaheadOutput) => {
    onChange(address.addressLineOneField ?? "");
    onSelect(address);
  };

  return (
    <div className={clsx(className, base)}>
      <Input
        id={id}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={input}
        autoComplete="off"
      />

      {showCurrentLocation && (
        <LocateButton onLocate={handleCurrentLocation} className={currentLocation} queryBounds={queryBounds} />
      )}
    </div>
  );
};
