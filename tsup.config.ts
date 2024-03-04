import { defineConfig } from "tsup";

export default defineConfig((options) => ({
  entry: ["src/**/*.(ts|tsx)"],
  dts: true,
  clean: true,
}));
