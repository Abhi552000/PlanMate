import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("recharts") || id.includes("d3-")) {
              return "charts";
            }
            if (id.includes("lucide-react")) {
              return "icons";
            }
            if (id.includes("@reduxjs/toolkit") || id.includes("react-redux")) {
              return "redux";
            }
            if (id.includes("react-router")) {
              return "router";
            }
            if (id.includes("react-toastify")) {
              return "toastify";
            }
            if (id.includes("axios")) {
              return "axios";
            }
            if (id.includes("react") || id.includes("scheduler")) {
              return "vendor";
            }
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
});
