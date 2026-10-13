import path from "path";

import {
  defineConfig,
} from "vite";

import react from "@vitejs/plugin-react";

/**
 * =====================================================
 * VITE CONFIG
 * =====================================================
 * ZALO WEBVIEW FIRST
 * MOBILE FIRST
 * ENTERPRISE FRONTEND
 * =====================================================
 */

export default defineConfig({

  esbuild: {
    drop:
      process.env.NODE_ENV === "production"
        ? ["console", "debugger"]
        : [],
  },

  plugins: [

    react(),

  ],

  resolve: {

    alias: {

      "@":
        path.resolve(
          __dirname,
          "./src"
        ),

    },

  },

  server: {

    host:
      "0.0.0.0",

    port:
      5173,

  },

  build: {
    rollupOptions: { input: { main: path.resolve(__dirname,"index.html"), qa: path.resolve(__dirname,"plaza-qa-f10.html") } },

    sourcemap:
      false,

    chunkSizeWarningLimit:
      1200,

    target:
      "es2020",

  },

});