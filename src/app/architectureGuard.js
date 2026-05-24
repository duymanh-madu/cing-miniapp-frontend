/**
 * ============================================
 * ARCHITECTURE GUARD V1 (PRODUCTION LOCK)
 * ============================================
 * Prevents:
 * - wrong imports
 * - page-layer reintroduction
 * - feature violations
 * ============================================
 */

const ALLOWED_LAYERS = [
  "features",
  "app",
  "router",
  "navigation",
  "runtime",
  "shared",
];

export function validateImport(path) {
  const isValid = ALLOWED_LAYERS.some(layer =>
    path.includes(layer)
  );

  if (!isValid) {
    console.error("[ARCHITECTURE VIOLATION]", path);
  }

  return isValid;
}