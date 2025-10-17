import type { Meta, StoryObj } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import { AddressForm } from "../../lib/components/AddressFormReact/AddressForm";
import { Flex } from "../../lib/components/Flex";

const meta = {
  title: "Component/AddressFormReact",
  component: AddressForm,
  tags: ["autodocs"],
  args: {
    onSubmit: action("onSubmit"),
    apiKey: "demo-api-key",
    region: "us-east-1",
  },
} satisfies Meta<typeof AddressForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <AddressForm {...args}>
      <Flex direction="row" flex>
        <Flex direction="column">
          <input
            data-type="address-form"
            name="addressLineOne"
            placeholder="Enter address"
            data-api-name="autocomplete"
          />
          <input data-type="address-form" name="addressLineTwo" />
          <input data-type="address-form" name="city" placeholder="City" />
          <input data-type="address-form" name="province" placeholder="State/Province" />
          <input data-type="address-form" name="postalCode" />
          <input data-type="address-form" name="country" placeholder="Country" />
          <Flex direction="row">
            <button address-form="submit">Submit</button>
            <button address-form="reset">Reset</button>
          </Flex>
        </Flex>
        <AddressForm.Map mapStyle={["Standard", "Light"]} />
      </Flex>
    </AddressForm>
  ),
};
