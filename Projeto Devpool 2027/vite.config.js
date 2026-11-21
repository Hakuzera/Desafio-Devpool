
import { defineConfig } from "vite";

export default defineConfig({
    root: "frontend",

    server: {
        host: "0.0.0.0",
        proxy: {
            "/users": {
                target: "http://127.0.0.1:3001",
                changeOrigin: true
            }
        }
    },

    build: {
        outDir: "../dist",
        emptyOutDir: true
    }
});
