import { dataContractExplorer } from "@/runtime/data-contract/dataContractExplorer";

export default function DataContractPage() {

  const contracts = dataContractExplorer.getAll();

  return (
    <div style={{ padding: 20 }}>

      <h2>🧠 DATA CONTRACT EXPLORER</h2>

      <div>
        <h3>Total Contracts: {contracts.length}</h3>
      </div>

      {contracts.map((c, i) => (
        <div key={i} style={{ marginBottom: 30 }}>

          <h4>📌 {c.event}</h4>

          <pre style={{ background: "#111", color: "#0f0", padding: 10 }}>
            {JSON.stringify(c.tree, null, 2)}
          </pre>

        </div>
      ))}

    </div>
  );
}
