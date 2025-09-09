import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  server: {
    proxy: {
      // Proxy API requests to Django backend
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        // Optional: rewrite the path if needed
        // rewrite: (path) => path.replace(/^\/api/, '/api')
      },
    },
  },
});
