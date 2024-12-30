import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0", // Allow external access (important for Docker)
    port: 5173, // Use the default Vite port
    hmr: {
      protocol: "ws", // Ensure WebSocket communication works
      host: "localhost", // Can be your Docker container IP or localhost
    },
  },
});
