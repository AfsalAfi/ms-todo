import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0", // Allow external access (important for Docker)
    hmr: {
      host: '52.66.76.120',  // Replace with your EC2 instance's public IP or domain
      protocol: 'ws',        // Use WebSocket for HMR
      port: 5173,            // The port your Vite server is running on
    },
  },
});
