import type { Preview } from "@storybook/react";
import { AmazonLocationProvider } from "@/components/AmazonLocationProvider";
import "maplibre-gl/dist/maplibre-gl.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },

  decorators: [
    (Story) => (
      <AmazonLocationProvider
        apiKey={import.meta.env.STORYBOOK_SDK_API_KEY}
        region={import.meta.env.STORYBOOK_SDK_REGION}
      >
        <Story />
      </AmazonLocationProvider>
    ),
  ],
};

export default preview;
