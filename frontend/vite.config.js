import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    proxy: {
      "/api": {
        //vite convet it into /api/v1/auth/login
        target: "http://localhost:5000",
        //changeOrigin: true, means it changes the origin of the request to the target url
        //so backend server will receive the request as /api/v1/auth/login
        // Adjust request origin for smoother backend communication.
        changeOrigin: true,
      },
    },
  },
});