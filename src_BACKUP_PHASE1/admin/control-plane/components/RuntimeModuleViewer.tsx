import React from "react";

export default function RuntimeModuleViewer() {

  const modules = [
    "SESSION",
    "CRM",
    "ORDER",
    "LOYALTY",
    "PAYMENT",
    "SOCKET",
  ];

  return (
    <div>
      <h2>Runtime Modules</h2>

      <ul>
        {modules.map(m => (
          <li key={m}>{m} — ACTIVE</li>
        ))}
      </ul>

    </div>
  );
}
