import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
    tailwindcss(),
  ],
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    // https://vitest.dev/config/#test-globals
    globals: true,
    css: true,
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
