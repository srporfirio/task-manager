import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";

function legacyRedirect(): Plugin {
  return {
    name: "legacy-redirect",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === "/legacy" || req.url === "/legacy/") {
          res.statusCode = 302;
          res.setHeader("Location", "/legacy/index.html");
          res.end();
          return;
        }
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === "/legacy" || req.url === "/legacy/") {
          res.statusCode = 302;
          res.setHeader("Location", "/legacy/index.html");
          res.end();
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [legacyRedirect(), react(), tailwindcss()],
  resolve: {
    alias: {
      "@task-manager/shared": resolve(__dirname, "../../packages/shared/src"),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});
