import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from "@headlessui/react";
import clsx from "clsx";
import { ChangeEvent, useMemo, useState } from "react";
import { countries, Country } from "../../data/countries";
import { Input, InputProps } from "../Input";
import { option, options } from "../Typeahead/styles.css";
import * as styles from "./styles.css";

interface BaseCountrySelectProps {
  id?: string;
  allowedCountries?: string[];
}

interface SingleCountrySelectProps extends BaseCountrySelectProps {
  multiple?: false;
  value: string | null;
  onChange: (value: string | null) => void;
}

interface MultiCountrySelectProps extends BaseCountrySelectProps {
  multiple: true;
  value: string[];
  onChange: (value: string[]) => void;
}

export type CountrySelectProps = (SingleCountrySelectProps | MultiCountrySelectProps) & 
  Omit<InputProps, "value" | "onChange" | "id">;

export const CountrySelect = ({
  id,
  value,
  onChange,
  allowedCountries: defaultAllowedCountries,
  multiple = false,
  ...inputProps
}: CountrySelectProps) => {
  const [query, setQuery] = useState("");
  const [allowedCountries] = useState(defaultAllowedCountries);

  const countryOptions = useMemo(() => {
    return allowedCountries ? countries.filter((country) => allowedCountries.includes(country.code)) : countries;
  }, [allowedCountries]);

  const selectedCountries = useMemo(() => {
    const values = Array.isArray(value) ? value : [value];
    return countryOptions.filter((country) => values.includes(country.code));
  }, [value, countryOptions]);

  const filteredCountries = useMemo(() => {
    return query.trim().length > 0
      ? countryOptions.filter((country) => country.name.toLowerCase().includes(query.toLowerCase()))
      : countryOptions;
  }, [countryOptions, query]);

  const isSelected = (country: Country) => {
    return selectedCountries.find(({ code }) => code === country.code);
  };

  const displayValue = query || selectedCountries.map((country) => country.name).join(", ");

  const handleChange = (value: Country | Country[] | null) => {
    if (multiple) {
      const countries = Array.isArray(value) ? value : [];
      (onChange as MultiCountrySelectProps["onChange"])(countries.map((country) => country.code));
    } else {
      const country = Array.isArray(value) ? value[0] : value;
      (onChange as SingleCountrySelectProps["onChange"])(country?.code ?? null);
    }
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.value) {
      handleChange(null);
    }

    setQuery(event.target.value);
  };

  return (
    <Combobox
      immediate
      multiple={multiple}
      onClose={() => setQuery("")}
      value={selectedCountries}
      onChange={handleChange}
    >
      <ComboboxInput
        id={id}
        as={Input}
        aria-label="Country"
        value={displayValue}
        onChange={handleInputChange}
        {...inputProps}
      />

      <ComboboxOptions anchor="bottom" className={options} hidden={filteredCountries.length === 0}>
        {filteredCountries.map((country) => (
          <ComboboxOption
            key={country.code}
            value={country}
            className={clsx(option, isSelected(country) && styles.selected)}
          >
            {country.name}
          </ComboboxOption>
        ))}
      </ComboboxOptions>
    </Combobox>
  );
};
