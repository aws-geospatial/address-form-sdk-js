import { ComponentProps, memo, PropsWithChildren } from "react";
import { replaceChildElements } from "../../utils/replace-child-elements";
import type { AddressFormData } from "./AddressForm";
import { Button } from "../Button";
import { TypeaheadAPIName } from "../Typeahead/use-typeahead-query";
import { AddressFormAddressField } from "./AddressFormAddressField";
import { AddressFormCountryField } from "./AddressFormCountryField";
import { AddressFormTextField } from "./AddressFormTextField";
import { SubmitButton } from "./SubmitButton";
import { getBoolean, getString } from "./utils";

export const Field: Record<string, keyof Omit<AddressFormData, "addressDetails">> = {
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
      replace: ({ "aria-label": label, placeholder, className, ...rest }: ComponentProps<"input">) => (
        <AddressFormAddressField
          name={Field.ADDRESS_LINE_ONE}
          label={label ?? "Address"}
          placeholder={placeholder ?? "Enter address"}
          className={className}
          apiName={(getString(rest, "data-api-name") ?? "suggest") as TypeaheadAPIName}
          showCurrentLocation={getBoolean(rest, "data-show-current-location") ?? true}
        />
      ),
    },

    // Address Line 2
    {
      search: <input data-type="address-form" name={Field.ADDRESS_LINE_TWO} />,
      replace: ({ "aria-label": label, placeholder, className }: ComponentProps<"input">) => (
        <AddressFormTextField
          name={Field.ADDRESS_LINE_TWO}
          label={label ?? "Address Line 2"}
          placeholder={placeholder ?? "Apartment, suite, etc."}
          className={className}
        />
      ),
    },

    // City
    {
      search: <input data-type="address-form" name={Field.CITY} />,
      replace: ({ "aria-label": label, placeholder, className }: ComponentProps<"input">) => (
        <AddressFormTextField
          name={Field.CITY}
          label={label ?? "City"}
          placeholder={placeholder}
          className={className}
        />
      ),
    },

    // Province/State
    {
      search: <input data-type="address-form" name={Field.PROVINCE} />,
      replace: ({ "aria-label": label, placeholder, className }: ComponentProps<"input">) => (
        <AddressFormTextField
          name={Field.PROVINCE}
          label={label ?? "Province/State"}
          placeholder={placeholder}
          className={className}
        />
      ),
    },

    // Postal/Zip code
    {
      search: <input data-type="address-form" name={Field.POSTAL_CODE} />,
      replace: ({ "aria-label": label, placeholder, className }: ComponentProps<"input">) => (
        <AddressFormTextField
          name={Field.POSTAL_CODE}
          label={label ?? "Postal/Zip code"}
          placeholder={placeholder}
          className={className}
        />
      ),
    },

    // Country
    {
      search: <input data-type="address-form" name={Field.COUNTRY} />,
      replace: ({ "aria-label": label, placeholder, className }: ComponentProps<"input">) => (
        <AddressFormCountryField
          name={Field.COUNTRY}
          label={label ?? "Country"}
          className={className}
          placeholder={placeholder}
        />
      ),
    },

    // Submit
    {
      search: <button data-type="address-form" type="submit" />,
      replace: (props: ComponentProps<"button">) => <SubmitButton {...props} />,
    },

    // Reset
    {
      search: <button data-type="address-form" type="reset" />,
      replace: (props: ComponentProps<"button">) => <Button {...props} type="reset" variant="secondary" />,
    },
  ]);
});
