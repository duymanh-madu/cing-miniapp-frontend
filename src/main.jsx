window.addEventListener(
  "unhandledrejection",
  (event) => {

    console.error(
      "UNHANDLED PROMISE REJECTION",
      event.reason
    );

  }
);

window.addEventListener(
  "error",
  (event) => {

    console.error(
      "GLOBAL ERROR",
      event.error
    );

  }
);

import React from "react";

import ReactDOM from "react-dom/client";

import {
  BrowserRouter,
} from "react-router-dom";

import App from "./App";

import "./index.css";

import webviewPerformanceBootstrap from "@/core/webview/webviewPerformanceBootstrap";

async function bootstrap() {

  await webviewPerformanceBootstrap
    .bootstrap();

  ReactDOM.createRoot(
    document.getElementById(
      "root"
    )
  ).render(

    <React.StrictMode>

      <BrowserRouter>

        <App />

      </BrowserRouter>

    </React.StrictMode>

  );

}

bootstrap();

window.addEventListener(
  "unhandledrejection",
  (event) => {

    console.warn(
      "UNHANDLED PROMISE",
      event.reason
    );

  }
);