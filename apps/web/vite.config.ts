import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@task-manager/shared": resolve(__dirname, "../../packages/shared/src"),
    },
  },
  server: {
    port: 5173,
  },
});
