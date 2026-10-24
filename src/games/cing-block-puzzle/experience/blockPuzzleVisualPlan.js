// Visual progression only. Never enters the engine, seed, replay or score.
export const VISUAL_STAGES = Object.freeze([
  { id: 'candy', name: 'Kẹo ánh sáng', at: 0, next: 600 },
  { id: 'crystal', name: 'Pha lê', at: 600, next: 1800 },
  { id: 'aurora', name: 'Cực quang', at: 1800, next: 4000 },
  { id: 'solar', name: 'Hoàng kim', at: 4000, next: null },
]);
export function visualStageForScore(score = 0) {
  return [...VISUAL_STAGES].reverse().find(stage => score >= stage.at) || VISUAL_STAGES[0];
}
export function clearedVisualCells(event, colors = []) {
  if (event?.type !== 'piece_placed' || !(event.lineCount > 0)) return [];
  const cells = new Map();
  const add = (row, col) => {
    if (Number.isInteger(row) && row >= 0 && row < 8 && col >= 0 && col < 8)
      cells.set(`${row}:${col}`, { row, col, shapeId: colors[row]?.[col] || 'cing-restore' });
  };
  for (const row of event.clearedRows || []) for (let col = 0; col < 8; col++) add(row, col);
  for (const col of event.clearedCols || []) for (let row = 0; row < 8; row++) add(row, col);
  return [...cells.values()];
}
