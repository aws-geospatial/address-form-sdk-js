import type { Meta, StoryObj } from "@storybook/react";
import { AddressForm, defaultAddressFormFields } from "../../lib/main";
import { action } from "@storybook/addon-actions";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: "Component/AddressForm",
  component: AddressForm,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {},
  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: {
    onSubmit: action("onSubmit"),
  },
} satisfies Meta<typeof AddressForm>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Default: Story = {
  args: {
    fields: defaultAddressFormFields,
    map: {
      // center: [-123.2063035, 49.2578182],
    },
    typeahead: {
      source: "suggest",
      placeTypes: ["Locality", "PostalCode"],
      // allowedCountries: ["FR"],
    },
  },
};

export const ConfigurableDefaultConfig: Story = {
  args: {
    fields: defaultAddressFormFields,
    typeahead: {
      source: "autocomplete",
      placeTypes: ["Locality", "PostalCode"],
    },
  },
};
