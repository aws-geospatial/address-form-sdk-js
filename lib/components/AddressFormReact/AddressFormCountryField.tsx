import { memo, useId } from "react";
import { AddressFormData } from "../AddressForm";
import { CountrySelect } from "../CountrySelect";
import { FormField } from "../FormField";
import { useAddressFormContext } from "./AddressFormContext";

export interface AddressFormCountryFieldProps {
  name: keyof AddressFormData;
  className?: string;
  label: string;
  placeholder?: string;
}

export const AddressFormCountryField = memo(({ name, className, label, placeholder }: AddressFormCountryFieldProps) => {
  const context = useAddressFormContext();
  const id = useId();

  return (
    <FormField id={id} label={label}>
      <CountrySelect
        id={id}
        name={name}
        className={className}
        placeholder={placeholder}
        multiple={false}
        value={context.data[name] ?? null}
        onChange={(country) => context.setData({ [name]: country ?? undefined })}
      />
    </FormField>
  );
});
