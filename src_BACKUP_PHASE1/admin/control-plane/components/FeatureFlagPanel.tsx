import React, { useState } from "react";

export default function FeatureFlagPanel() {

  const [flags, setFlags] = useState([
    { key: "LOYALTY_SYSTEM", enabled: true },
    { key: "CAMPAIGN_SYSTEM", enabled: true },
    { key: "AUTOMATION_ENGINE", enabled: false },
  ]);

  const toggle = (index: number) => {
    const newFlags = [...flags];
    newFlags[index].enabled = !newFlags[index].enabled;
    setFlags(newFlags);
  };

  return (
    <div>
      <h2>Feature Flags</h2>

      {flags.map((f, i) => (
        <div key={f.key} style={{ marginBottom: 8 }}>
          <span>{f.key}</span>
          <button onClick={() => toggle(i)} style={{ marginLeft: 10 }}>
            {f.enabled ? "Disable" : "Enable"}
          </button>
        </div>
      ))}

    </div>
  );
}
