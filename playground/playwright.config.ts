import { defineConfig } from "@playwright/test";

export default defineConfig({
  testMatch: "e2e.spec.ts",
  use: {
    baseURL: "http://localhost:5173",
    headless: true,
  },
  // Dev server must already be running
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: true,
    timeout: 15000,
  },
});
