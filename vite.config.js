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

    sourcemap:
      false,

    chunkSizeWarningLimit:
      1200,

    target:
      "es2020",

  },

});