import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    global: 'globalThis',
    Buffer: 'Buffer',
    process: 'process',
  },
  optimizeDeps: {
    include: ['buffer'],
  },
  esbuild: {
    define: {
      global: 'globalThis',
    },
  },
  build: {
    rollupOptions: {
      external: [],
    },
    // Ensure environment variables are available at build time
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || '/api/v1'),
    },
  },
});
