const MIN_FINGER_CLEARANCE_PX =
  78;

const MAX_FINGER_CLEARANCE_PX =
  108;

const CELL_CLEARANCE_FACTOR =
  2.15;

function finite(
  value
) {
  return (
    typeof value === "number" &&
    Number.isFinite(value)
  );
}

function clamp(
  value,
  min,
  max
) {
  return Math.max(
    min,
    Math.min(
      max,
      value
    )
  );
}

/*
 * Converts the real finger position into
 * the visual/drop control point.
 *
 * The piece remains geometrically aligned
 * with the board target, but floats above
 * the finger so the user's hand never
 * hides the active piece.
 */
export function
resolveBlockPuzzleDragControlPoint({
  clientX,
  clientY,
  cellHeight,
}) {
  if (
    !finite(clientX) ||
    !finite(clientY) ||
    !finite(cellHeight) ||
    cellHeight <= 0
  ) {
    return null;
  }

  const clearance =
    clamp(
      cellHeight *
        CELL_CLEARANCE_FACTOR,

      MIN_FINGER_CLEARANCE_PX,
      MAX_FINGER_CLEARANCE_PX
    );

  return Object.freeze({
    clientX,

    clientY:
      clientY -
      clearance,

    clearance,
  });
}
