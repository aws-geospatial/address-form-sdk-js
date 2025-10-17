import { action } from "@storybook/addon-actions";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { TypeaheadProps } from "../../lib/components/Typeahead";
import { Typeahead } from "../../lib/main";

const ControlledTypeahead = (props: TypeaheadProps) => {
  const [value, setValue] = useState("");
  return <Typeahead {...props} value={value} onChange={setValue} />;
};

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: "Component/Typeahead",
  component: ControlledTypeahead,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {
    source: {
      control: "radio",
      options: ["autocomplete", "suggest", null],
    },
    onSelect: {
      action: "selected",
    },
  },
  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: {
    onChange: action("onChange"),
    onSelect: action("onSelect"),
  },
} satisfies Meta<typeof Typeahead>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Default: Story = {
  args: {
    value: "",
    source: "autocomplete",
  }, // No need to specify the action here
};
