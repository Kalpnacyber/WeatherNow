import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// In development, calls to /api and /favorites are forwarded to the Express backend
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:3000",
      "/favorites": "http://localhost:3000",
    },
  },
});
