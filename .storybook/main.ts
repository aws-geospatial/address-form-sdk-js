import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: [
    "../src/stories/AddressFormReact.stories.tsx", // Default (homepage) story
    "../src/stories/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],

  addons: ["@storybook/addon-docs", "@storybook/addon-onboarding"],

  framework: {
    name: "@storybook/react-vite",
    options: {},
  },

  viteFinal(config) {
    config.resolve ??= {};
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": new URL("../lib", import.meta.url).pathname,
    };

    return config;
  },
};

export default config;
