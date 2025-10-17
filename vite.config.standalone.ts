import { defineConfig } from "vite";
import { resolve } from "path";
import react from "@vitejs/plugin-react";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";

export default defineConfig({
  plugins: [react(), vanillaExtractPlugin()],

  build: {
    outDir: "dist/standalone",

    lib: {
      entry: resolve(__dirname, "lib/main-standalone.tsx"),
      formats: ["umd"],
      name: "AddressFormSDK",
      fileName: "address-form-sdk",
    },
  },

  define: {
    "process.env.NODE_ENV": '"production"',
  },
});
