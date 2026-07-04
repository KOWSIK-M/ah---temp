import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Proxy all /api requests to the backend
      // This makes requests same-origin, solving cookie issues
      "/api": {
        target: "http://localhost:8888",
        changeOrigin: true,
        secure: false,
      },
      // Proxy OAuth login/callback endpoints only.
      // Do not proxy /oauth2/redirect, because that is a frontend route.
      "/oauth2/authorization": {
        target: "http://localhost:8888",
        changeOrigin: true,
        secure: false,
      },
      "/login/oauth2": {
        target: "http://localhost:8888",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
