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