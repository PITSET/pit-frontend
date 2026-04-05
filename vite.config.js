import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("framer-motion")) {
              return "vendor-framer-motion";
            }
            if (id.includes("recharts")) {
              return "vendor-recharts";
            }
            if (id.includes("@supabase")) {
              return "vendor-supabase";
            }
            if (
              id.includes("react/") ||
              id.includes("react-dom") ||
              id.includes("react-router-dom") ||
              id.includes("react-router") ||
              id.includes("@remix-run")
            ) {
              return "vendor-react";
            }
            if (id.includes("lucide-react") || id.includes("react-icons") || id.includes("@heroicons")) {
              return "vendor-icons";
            }
            return "vendor"; // All other third-party libraries
          }
        },
      },
    },
  },
});
