import { ComponentProps, memo, PropsWithChildren } from "react";
import { replaceChildElements } from "../../utils/replace-child-elements";
import { AddressFormData } from "../AddressForm";
import { Button } from "../Button";
import { TypeaheadSource } from "../Typeahead/use-typeahead-query";
import { AddressFormAddressField } from "./AddressFormAddressField";
import { AddressFormCountryField } from "./AddressFormCountryField";
import { AddressFormTextField } from "./AddressFormTextField";
import { getBoolean, getString } from "./utils";

export const Field: Record<string, keyof AddressFormData> = {
  ADDRESS_LINE_ONE: "addressLineOne",
  ADDRESS_LINE_TWO: "addressLineTwo",
  CITY: "city",
  PROVINCE: "province",
  POSTAL_CODE: "postalCode",
  COUNTRY: "country",
  ORIGINAL_POSITION: "originalPosition",
  ADJUSTED_POSITION: "adjustedPosition",
} as const;

export type Field = (typeof Field)[keyof typeof Field];

export const AddressFormFields = memo(({ children }: PropsWithChildren) => {
  return replaceChildElements(children, [
    // Address
    {
      search: <input data-type="address-form" name={Field.ADDRESS_LINE_ONE} />,
      replace: ({ "aria-label": label, name, placeholder, className, ...rest }: ComponentProps<"input">) => (
        <AddressFormAddressField
          name={name as Field}
          label={label ?? "Address"}
          placeholder={placeholder ?? "Enter address"}
          className={className}
          apiName={(getString(rest, "data-api-name") ?? "autocomplete") as TypeaheadSource}
          showCurrentLocation={getBoolean(rest, "data-show-current-location") ?? true}
        />
      ),
    },

    // Address Line 2
    {
      search: <input data-type="address-form" name={Field.ADDRESS_LINE_TWO} />,
      replace: ({ "aria-label": label, name, placeholder, className }: ComponentProps<"input">) => (
        <AddressFormTextField
          name={name as Field}
          label={label ?? "Address Line 2"}
          placeholder={placeholder ?? "Apartment, suite, etc."}
          className={className}
        />
      ),
    },

    // City
    {
      search: <input data-type="address-form" name={Field.CITY} />,
      replace: ({ "aria-label": label, name, placeholder, className }: ComponentProps<"input">) => (
        <AddressFormTextField
          name={name as Field}
          label={label ?? "City"}
          placeholder={placeholder}
          className={className}
        />
      ),
    },

    // Province/State
    {
      search: <input data-type="address-form" name={Field.PROVINCE} />,
      replace: ({ "aria-label": label, name, placeholder, className }: ComponentProps<"input">) => (
        <AddressFormTextField
          name={name as Field}
          label={label ?? "Province/State"}
          placeholder={placeholder}
          className={className}
        />
      ),
    },

    // Postal/Zip code
    {
      search: <input data-type="address-form" name={Field.POSTAL_CODE} />,
      replace: ({ "aria-label": label, name, placeholder, className }: ComponentProps<"input">) => (
        <AddressFormTextField
          name={name as Field}
          label={label ?? "Postal/Zip code"}
          placeholder={placeholder}
          className={className}
        />
      ),
    },

    // Country
    {
      search: <input data-type="address-form" name={Field.COUNTRY} />,
      replace: ({ "aria-label": label, name, placeholder, className }: ComponentProps<"input">) => (
        <AddressFormCountryField
          name={name as Field}
          label={label ?? "Country"}
          className={className}
          placeholder={placeholder}
        />
      ),
    },

    // Submit
    {
      search: <button data-type="address-form" type="submit" />,
      replace: (props: ComponentProps<"button">) => <Button {...props} type="submit" />,
    },

    // Reset
    {
      search: <button data-type="address-form" type="reset" />,
      replace: (props: ComponentProps<"button">) => <Button {...props} type="reset" />,
    },
  ]);
});


