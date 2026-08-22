function finite(
  value
) {
  return (
    typeof value === "number" &&
    Number.isFinite(value)
  );
}

export function
resolveNearestPieceAnchor({
  clientX,
  clientY,
  slotRect,
  piece,
  slotSize,
  cellSize,
}) {
  if (
    !finite(clientX) ||
    !finite(clientY) ||
    !slotRect ||
    !finite(slotRect.left) ||
    !finite(slotRect.top) ||
    !finite(slotRect.width) ||
    !finite(slotRect.height) ||
    slotRect.width <= 0 ||
    slotRect.height <= 0 ||
    !piece ||
    !Array.isArray(
      piece.cells
    ) ||
    piece.cells.length === 0 ||
    !finite(slotSize) ||
    slotSize <= 0 ||
    !finite(cellSize) ||
    cellSize <= 0
  ) {
    return null;
  }

  const maxRow =
    Math.max(
      ...piece.cells.map(
        ([row]) => row
      )
    );

  const maxCol =
    Math.max(
      ...piece.cells.map(
        ([, col]) => col
      )
    );

  const gridWidth =
    (maxCol + 1) *
    cellSize;

  const gridHeight =
    (maxRow + 1) *
    cellSize;

  const scaleX =
    slotRect.width /
    slotSize;

  const scaleY =
    slotRect.height /
    slotSize;

  const localX =
    (
      clientX -
      slotRect.left
    ) /
    scaleX;

  const localY =
    (
      clientY -
      slotRect.top
    ) /
    scaleY;

  const gridLeft =
    (
      slotSize -
      gridWidth
    ) / 2;

  const gridTop =
    (
      slotSize -
      gridHeight
    ) / 2;

  let nearest =
    null;

  let nearestDistance =
    Infinity;

  for (
    const [
      row,
      col,
    ] of piece.cells
  ) {
    const centerX =
      gridLeft +
      (
        col + 0.5
      ) *
        cellSize;

    const centerY =
      gridTop +
      (
        row + 0.5
      ) *
        cellSize;

    const dx =
      localX -
      centerX;

    const dy =
      localY -
      centerY;

    const distance =
      dx * dx +
      dy * dy;

    if (
      distance <
      nearestDistance
    ) {
      nearestDistance =
        distance;

      nearest = {
        row,
        col,
      };
    }
  }

  return nearest
    ? Object.freeze(
        nearest
      )
    : null;
}
