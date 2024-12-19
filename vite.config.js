import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.js", 
  },
  optimizeDeps: {
    include: ["jwt-decode"],
  },
  server: {
    port: 3000, // Runs the app on http://localhost:3000
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Backend URL
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '') // Strips "/api" prefix if needed
      }
    }
  }
  
});

