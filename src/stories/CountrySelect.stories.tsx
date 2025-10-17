/* eslint-disable react-hooks/rules-of-hooks */
import { action } from "@storybook/addon-actions";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { CountrySelect, CountrySelectProps } from "../../lib/main";

// Controlled wrapper for single selection
const ControlledSingleCountrySelect = (props: Omit<CountrySelectProps, "multiple" | "value" | "onChange">) => {
  const [value, setValue] = useState<string | null>(null);

  return (
    <CountrySelect
      {...props}
      value={value}
      onChange={(value) => {
        setValue(value);
        action("onChange")(value);
      }}
    />
  );
};

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: "Component/CountrySelect",
  component: ControlledSingleCountrySelect,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {
    allowedCountries: {
      control: "object",
      description: "Array of country codes to limit the available options",
    },
  },
  // Use `fn` to spy on the onChange arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: {},
} satisfies Meta<typeof ControlledSingleCountrySelect>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Default: Story = {
  args: {},
};

export const WithPreselectedValue: Story = {
  render: (args) => {
    const [value, setValue] = useState<string | null>("US");
    return (
      <CountrySelect
        {...args}
        value={value}
        onChange={(value) => {
          setValue(value);
          action("onChange")(value);
        }}
      />
    );
  },
};

export const MultipleSelection: Story = {
  render: (args) => {
    const [value, setValue] = useState<string[]>(["US", "CA", "GB"]);
    return (
      <CountrySelect
        {...args}
        multiple
        value={value}
        onChange={(value) => {
          setValue(value);
          action("onChange")(value);
        }}
      />
    );
  },
};

export const LimitedCountries: Story = {
  args: {
    allowedCountries: ["US", "CA", "GB", "FR", "DE", "JP", "AU"],
  },
};

export const MultipleWithLimitedCountries: Story = {
  render: (args) => {
    const [value, setValue] = useState<string[]>(["US", "GB"]);
    return (
      <CountrySelect
        {...args}
        multiple
        value={value}
        onChange={(value) => {
          setValue(value);
          action("onChange")(value);
        }}
        allowedCountries={["US", "CA", "GB", "FR", "DE", "JP", "AU", "IN", "BR", "MX"]}
      />
    );
  },
};

export const EmptyMultipleSelection: Story = {
  render: (args) => {
    const [value, setValue] = useState<string[]>([]);
    return (
      <CountrySelect
        {...args}
        multiple
        value={value}
        onChange={(value) => {
          setValue(value);
          action("onChange")(value);
        }}
      />
    );
  },
};
