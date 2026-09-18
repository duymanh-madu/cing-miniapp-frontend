import React from "react";
// Cache SHELL_BOOT_DATA sớm nhất — trước khi React mount
(window as any).__shellBootData = null;
window.addEventListener("message", (e: any) => {
  if (e.data?.type === "SHELL_BOOT_DATA") {
    (window as any).__shellBootData = e.data;
    console.log("[BOOT] SHELL_BOOT_DATA cached:", e.data?.zaloId);
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