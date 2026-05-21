import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      "/products": "http://localhost:8083", // ← замените, если бэкенд на другом порту
      "/api/documents": {
        // документы
        target: "http://localhost:8082",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/documents/, "/api/files"),
      },
    },
  },
});
