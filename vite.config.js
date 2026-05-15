import {
  defineConfig,
} from "vite";

import react
  from "@vitejs/plugin-react";

import path
  from "path";

/**
 * =========================================================
 * VITE CONFIG
 * =========================================================
 */

export default defineConfig({

  /**
   * =======================================================
   * PLUGINS
   * =======================================================
   */

  plugins: [
    react(),
  ],

  /**
   * =======================================================
   * RESOLVE
   * =======================================================
   */

  resolve: {

    alias: {

      "@":
        path.resolve(
          __dirname,
          "./src"
        ),

    },

  },

  /**
   * =======================================================
   * DEV SERVER
   * =======================================================
   */

  server: {

    host: "0.0.0.0",

    port: 3000,

    strictPort: true,

    open: false,

  },

  /**
   * =======================================================
   * PREVIEW SERVER
   * =======================================================
   */

  preview: {

    host: "0.0.0.0",

    port: 4173,

    strictPort: true,

  },

  /**
   * =======================================================
   * BUILD
   * =======================================================
   */

  build: {

    target: "esnext",

    sourcemap: false,

    minify: "esbuild",

    chunkSizeWarningLimit:
      1000,

    rollupOptions: {

      output: {

        manualChunks: {

          vendor: [
            "react",
            "react-dom",
          ],

          router: [
            "react-router-dom",
          ],

          realtime: [
            "socket.io-client",
          ],

        },

      },

    },

  },

  /**
   * =======================================================
   * OPTIMIZE DEPS
   * =======================================================
   */

  optimizeDeps: {

    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "socket.io-client",
    ],

  },

});