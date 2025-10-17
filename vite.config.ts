import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import react from "@vitejs/plugin-react";
import path, { resolve } from "path";
import { visualizer } from "rollup-plugin-visualizer";
import dts from "vite-plugin-dts";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    react(),
    vanillaExtractPlugin(),
    dts({
      include: ["lib"],
      exclude: ["lib/main-standalone.tsx", "lib/**/*.css.ts", "lib/setupTests.ts", "**/*.test.{ts,tsx}"],
      tsconfigPath: "./tsconfig.lib.json",
    }),
  ],

  build: {
    outDir: "dist/lib",
    // sourcemap: true,

    lib: {
      entry: resolve(__dirname, "lib/main.tsx"),
      formats: ["cjs"], // We can't use ES modules until we upgrade to React v19 in the console
      fileName: (format) => `address-form-sdk.${format}.js`,
    },

    rollupOptions: {
      plugins: [visualizer()],

      external: [
        "@aws-sdk/client-geo-places",
        "@aws/amazon-location-utilities-auth-helper",
        "@headlessui/react",
        "@vanilla-extract/css",
        "react",
        "react-jsx/runtime",
        "react-dom",
        "react-hook-form",
        "react-map-gl",
        "maplibre-gl",
        "@vanilla-extract/css",
        "@vis.gl/react-maplibre",
        "react/jsx-runtime",
      ],
    },
  },

  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./lib/setup-tests.ts",

    coverage: {
      include: ["lib/**"],
      reportsDirectory: path.join(__dirname, "build", "brazil-documentation", "coverage"),
      reporter: ["text", "cobertura"],
    },
  },
});
