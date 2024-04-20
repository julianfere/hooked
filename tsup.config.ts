import { defineConfig } from "tsup";

export default defineConfig({
  format: ["cjs", "esm"],
  clean: true,
  minify: true,
  treeshake: true,
  sourcemap: true,
  splitting: true,
  outDir: "dist",
  entry: {
    index: "src/index.ts",
    events: "src/EventContext/index.ts",
    authentication: "src/Authentication/index.ts",
  },
  experimentalDts: true, // Generate .d.ts file in dist folder
  name: "Hooked",
});
