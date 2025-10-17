import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../src/stories/**/*.mdx", "../src/stories/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: ["@storybook/addon-essentials", "@storybook/addon-onboarding", "@storybook/addon-interactions"],

  framework: {
    name: "@storybook/react-vite",
    options: {},
  },

  viteFinal(config) {
    if (config.resolve) {
      config.resolve.alias = {
        ...config.resolve?.alias,
        "@": new URL("../lib", import.meta.url).pathname,
      };
    }

    return config;
  },
};

export default config;
