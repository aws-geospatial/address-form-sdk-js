import { Address } from "@aws-sdk/client-geo-places";
import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from "@headlessui/react";
import { useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import useAmazonLocationContext from "../../hooks/use-amazon-location-context.ts";
import { useDebounce } from "../../utils/debounce.ts";
import { getPlaceQuery } from "../../utils/queries.ts";
import { Input } from "../Input/index.tsx";
import { LocateButton } from "../LocateButton";
import { base, currentLocation, info, input, option, options } from "./styles.css.ts";
import {
  TypeaheadResultItem,
  TypeaheadSource,
  TypeaheadSourceInput,
  useTypeaheadQuery,
} from "./use-typeahead-query.ts";

export interface TypeaheadOutput {
  addressLineOneField?: string;
  fullAddress?: Address;
  position?: [number, number];
}

export interface TypeaheadProps {
  id?: string;
  name?: string;
  placeholder?: string;
  className?: string;
  source: TypeaheadSource | null;
  sourceInput?: TypeaheadSourceInput;
  value: string;
  onChange: (value: string) => void;
  onSelect: (value: TypeaheadOutput) => void;
  showCurrentLocation?: boolean;
  debounce?: number;
}

export const Typeahead = ({ source, ...props }: TypeaheadProps) => {
  return source ? <SourceTypeahead {...props} source={source} /> : <InputTypeahead {...props} source={null} />;
};

const SourceTypeahead = ({
  id,
  name,
  placeholder,
  className,
  value,
  onChange,
  source,
  sourceInput,
  onSelect,
  showCurrentLocation = true,
  debounce = 300,
}: TypeaheadProps & { source: TypeaheadSource }) => {
  const debouncedValue = useDebounce(value, debounce);
  const { client } = useAmazonLocationContext();
  const queryClient = useQueryClient();
  const isValid = debouncedValue.length >= 2;

  const { data = [], isLoading } = useTypeaheadQuery({
    client,
    source,
    sourceInput: { QueryText: debouncedValue, MaxResults: 5, ...sourceInput },
    enabled: isValid,
  });

  const handleAddressSelect = async (address: TypeaheadResultItem | null) => {
    if (!address) {
      return;
    }

    onChange(address.title);

    const result = await queryClient.ensureQueryData(
      getPlaceQuery(client, {
        PlaceId: address.placeId,
        Language: sourceInput?.Language,
        PoliticalView: sourceInput?.PoliticalView,
      }),
    );

    const [lng, lat] = result.Position ?? [];

    onSelect({
      addressLineOneField: result.Address?.Label ?? "",
      fullAddress: result.Address,
      position: result.Position ? [lng, lat] : undefined,
    });

    // The user selected an address, we can clear the cache
    queryClient.invalidateQueries({ queryKey: ["typeahead"] });
    queryClient.invalidateQueries({ queryKey: ["getPlace"] });
  };

  const handleCurrentLocation = (address: TypeaheadOutput) => {
    onChange(address.addressLineOneField ?? "");
    onSelect(address);
  };

  return (
    <div className={clsx(className, base)}>
      <Combobox onChange={handleAddressSelect}>
        <ComboboxInput
          as={Input}
          id={id}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={input}
          autoComplete="off"
        />

        {isValid && (
          <ComboboxOptions
            transition
            anchor="bottom start"
            className={options}
            data-testid={`aws-typeahead-results-${source}`}
          >
            {isLoading && (
              <ComboboxOption value={null} className={info} disabled>
                Loading...
              </ComboboxOption>
            )}

            {data.length === 0 && !isLoading && (
              <ComboboxOption value={null} className={info} disabled>
                No results
              </ComboboxOption>
            )}

            {data.map((results) => (
              <ComboboxOption key={results.placeId} value={results} className={option}>
                {results.title}
              </ComboboxOption>
            ))}
          </ComboboxOptions>
        )}
      </Combobox>

      {showCurrentLocation && <LocateButton onLocate={handleCurrentLocation} className={currentLocation} />}
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

      {showCurrentLocation && <LocateButton onLocate={handleCurrentLocation} className={currentLocation} />}
    </div>
  );
};
