import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  root: __dirname,
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}", "src/**/*.spec.{ts,tsx}"],
    resolve: {
      alias: { "@": path.resolve(__dirname, "./src") },
    },
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});