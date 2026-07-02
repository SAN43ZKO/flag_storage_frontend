import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  server: {
    host:'0.0.0.0',
    prot: 5173,
    proxy: {
      "/products": "http://localhost:8085",
      "/products/receipt": "http://localhost:8085",//← замените, если бэкенд на другом порту
      '/products/autocomplete': 'http://localhost:8085',
      "/api/stats": "http://localhost:8085", // ← замените, если бэкенд на другом порту
      "/api/units": "http://localhost:8085", // ← замените, если бэкенд на другом порту
      "/api/categories": "http://localhost:8085", // ← замените, если бэкенд на другом порту
      "/api/products/low-stock": "http://localhost:8085", // ← замените, если бэкенд на другом порту
      // "/api/documents": {
      //   // документы
      //   target: "http://localhost:8086",
      //   changeOrigin: true,
      //   rewrite: (path) => path.replace(/^\/api\/documents/, "/api/files"),
      // },
    },
  },
});
