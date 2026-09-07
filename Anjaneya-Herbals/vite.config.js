import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const backend = env.VITE_API_PROXY_TARGET || "http://localhost:8888";
  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
      // Proxy all /api requests to the backend
      // This makes requests same-origin, solving cookie issues
      "/api": {
        target: backend,
        changeOrigin: true,
        secure: false,
      },
      // Proxy OAuth login/callback endpoints only.
      // Do not proxy /oauth2/redirect, because that is a frontend route.
      "/oauth2/authorization": {
        target: backend,
        changeOrigin: true,
        secure: false,
      },
      "/login/oauth2": {
        target: backend,
        changeOrigin: true,
        secure: false,
      },
      },
    },
  };
});
