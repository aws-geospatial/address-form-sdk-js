import fs from "node:fs";
import { builtinModules, createRequire } from "node:module";
import path, { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import { defineConfig, type Plugin } from "vite";

const require = createRequire(import.meta.url);
const maplibreWorkerFiles = ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"];

function maplibreWorkerAssets(): Plugin {
  return {
    name: "maplibre-worker-assets",
    generateBundle() {
      const maplibreDist = path.dirname(require.resolve("maplibre-gl/dist/maplibre-gl.mjs"));

      for (const fileName of maplibreWorkerFiles) {
        const source = fs.readFileSync(path.join(maplibreDist, fileName), "utf8");
        this.emitFile({
          type: "asset",
          fileName,
          source: source.replace(/\n\/\/# sourceMappingURL=.*\n?$/, "\n"),
        });
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), vanillaExtractPlugin(), maplibreWorkerAssets()],

  build: {
    outDir: "dist/standalone",

    lib: {
      entry: resolve(__dirname, "lib/main-standalone.tsx"),
      formats: ["umd"],
      name: "AddressFormSDK",
      fileName: "address-form-sdk",
    },

    rollupOptions: {
      external: builtinModules.flatMap((m) => [m, `node:${m}`]),
    },
  },

  define: {
    "process.env.NODE_ENV": '"production"',
  },
});
