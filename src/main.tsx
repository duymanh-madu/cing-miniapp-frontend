import React from "react";
import {
  markStartup,
} from "@/runtime/startup/startupDiagnostic";
import {
  installStartupLifecycleDiagnostic,
} from "@/runtime/startup/startupLifecycleDiagnostic";

installStartupLifecycleDiagnostic();
markStartup("main-entry");
// Cache SHELL_BOOT_DATA sớm nhất — trước khi React mount
(window as any).__shellBootData = null;
window.addEventListener("message", (e: any) => {
  if (e.data?.type === "SHELL_BOOT_DATA") {
    (window as any).__shellBootData = e.data;
  }
});
import ReactDOM from "react-dom/client";

import App from "./App";

import "./index.css";

ReactDOM.createRoot(
  document.getElementById("root")!
).render(
  <App />
);