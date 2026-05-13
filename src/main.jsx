import React from "react";

import ReactDOM from "react-dom/client";

import App from "./App";

import "@/styles/index.css";

/**
 * =========================================================
 * ROOT
 * =========================================================
 */

const rootElement =
  document.getElementById(
    "root"
  );

/**
 * =========================================================
 * ROOT RENDER
 * =========================================================
 */

ReactDOM.createRoot(
  rootElement
).render(

  <React.StrictMode>

    <App />

  </React.StrictMode>

);