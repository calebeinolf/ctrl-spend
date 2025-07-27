import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Node modules chunking
          if (id.includes("node_modules")) {
            // React ecosystem
            if (id.includes("react") || id.includes("react-dom")) {
              return "react";
            }
            // React Router
            if (id.includes("react-router")) {
              return "router";
            }
            // Firebase
            if (id.includes("firebase") || id.includes("@firebase")) {
              return "firebase";
            }
            // UI libraries
            if (id.includes("lucide-react") || id.includes("@dnd-kit")) {
              return "ui";
            }
            // Other vendor libraries
            return "vendor";
          }

          // App code chunking
          if (id.includes("/contexts/")) {
            return "contexts";
          }
          if (id.includes("/utils/")) {
            return "utils";
          }
          if (id.includes("/components/")) {
            return "components";
          }
        },
      },
    },
    chunkSizeWarningLimit: 400, // Lower warning limit to catch issues earlier
  },
});
