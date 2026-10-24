import { nativeBlockPuzzleHaptic } from './blockPuzzleNativeHaptics.js';
// Presentation preferences never enter the replay, scoring or purchase contracts.
export const PREFERENCES_KEY = 'cing.block-puzzle.experience.v1';
export const DEFAULT_PREFERENCES = Object.freeze({
  sound: true, music: true, voice: true, vibration: true, effects: 'full', volume: 0.7,
});
export function normalizePreferences(value = {}) {
  if (!value || typeof value !== 'object') value = {};
  return {
    sound: typeof value.sound === 'boolean' ? value.sound : true,
    music: typeof value.music === 'boolean' ? value.music : true,
    voice: typeof value.voice === 'boolean' ? value.voice : true,
    vibration: typeof value.vibration === 'boolean' ? value.vibration : true,
    effects: value.effects === 'calm' ? 'calm' : 'full',
    volume: Number.isFinite(value.volume) ? Math.max(0, Math.min(1, value.volume)) : 0.7,
  };
}
export function readPreferences(storage) {
  try { return normalizePreferences(JSON.parse(storage.getItem(PREFERENCES_KEY))); }
  catch { return { ...DEFAULT_PREFERENCES }; }
}
export function savePreferences(storage, value) {
  try { storage.setItem(PREFERENCES_KEY, JSON.stringify(normalizePreferences(value))); return true; }
  catch { return false; }
}
// Derive a prospective clear without modifying the actual board or running RNG.
export function previewCompletedLines(board, preview) {
  const cells = new Set();
  if (!preview?.valid || !Array.isArray(board) || !board.length) return cells;
  const placed = new Set(preview.cells.map(({ row, col }) => `${row}:${col}`));
  const occupied = (row, col) => board[row][col] === 1 || placed.has(`${row}:${col}`);
  for (let row = 0; row < board.length; row += 1) {
    if (board[row].every((_, col) => occupied(row, col))) {
      for (let col = 0; col < board[row].length; col += 1) cells.add(`${row}:${col}`);
    }
  }
  for (let col = 0; col < board[0].length; col += 1) {
    if (board.every((_, row) => occupied(row, col))) {
      for (let row = 0; row < board.length; row += 1) cells.add(`${row}:${col}`);
    }
  }
  return cells;
}
export function moveHapticPattern(event) {
  if (event?.type !== 'piece_placed') return [];
  if (event.perfectClear) return [16, 35, 24];
  if (event.lineCount > 1 || event.comboAdvanced) return [12, 28, 18];
  return event.lineCount > 0 ? [16] : [7];
}
export function playHaptic(event, preferences, device = globalThis.navigator) {
  if (!preferences.vibration || globalThis.document?.hidden) return false;
  const pattern = moveHapticPattern(event);
  if (!pattern.length) return false;
  if (device === globalThis.navigator && nativeBlockPuzzleHaptic(event)) return true;
  if (typeof device?.vibrate !== 'function') return false;
  try { return device.vibrate(pattern); } catch { return false; }
}
