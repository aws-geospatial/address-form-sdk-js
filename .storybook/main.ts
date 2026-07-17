import { builtinModules } from "module";
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

    config.build ??= {};
    config.build.rollupOptions ??= {};
    const existing = config.build.rollupOptions.external;
    const nodeBuiltins = [...builtinModules, ...builtinModules.map((m) => `node:${m}`)];
    config.build.rollupOptions.external = Array.isArray(existing)
      ? [...existing, ...nodeBuiltins]
      : nodeBuiltins;

    return config;
  },
};

export default config;
