const samples = new Map();
export async function measureBlockPuzzleOperation(name, task) {
  const started = performance.now();
  try { return await task(); }
  finally {
    const values = samples.get(name) || [];
    values.push(performance.now() - started);
    if (values.length > 60) values.shift();
    samples.set(name, values);
  }
}
export function getBlockPuzzleLatencySummary() {
  return Object.fromEntries([...samples].map(([name, values]) => {
    const sorted = values.slice().sort((a,b)=>a-b);
    return [name, {count:values.length,p50:sorted[Math.floor((sorted.length-1)*.5)],p95:sorted[Math.ceil((sorted.length-1)*.95)]}];
  }));
}
