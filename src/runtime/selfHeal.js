/**
 * ============================================
 * SELF HEAL ENGINE V1
 * ============================================
 */

export function safeExecute(fn, fallback = null) {
  try {
    return fn();
  } catch (e) {
    console.error("[SELF HEAL]", e);
    return fallback;
  }
}