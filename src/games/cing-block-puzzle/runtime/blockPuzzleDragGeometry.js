import {
  BOARD_SIZE,
} from "../engine/index.js";

function finite(value) {
  return (
    typeof value === "number" &&
    Number.isFinite(value)
  );
}

export function resolveBoardDropOrigin({
  clientX,
  clientY,
  boardRect,
  anchorRow,
  anchorCol,
}) {
  if (
    !finite(clientX) ||
    !finite(clientY) ||
    !boardRect ||
    !finite(boardRect.left) ||
    !finite(boardRect.top) ||
    !finite(boardRect.width) ||
    !finite(boardRect.height) ||
    boardRect.width <= 0 ||
    boardRect.height <= 0 ||
    !Number.isInteger(anchorRow) ||
    !Number.isInteger(anchorCol) ||
    anchorRow < 0 ||
    anchorCol < 0
  ) {
    return null;
  }

  const localX =
    clientX - boardRect.left;

  const localY =
    clientY - boardRect.top;

  if (
    localX < 0 ||
    localY < 0 ||
    localX >= boardRect.width ||
    localY >= boardRect.height
  ) {
    return null;
  }

  const cellWidth =
    boardRect.width /
    BOARD_SIZE;

  const cellHeight =
    boardRect.height /
    BOARD_SIZE;

  const pointerCol =
    Math.floor(
      localX / cellWidth
    );

  const pointerRow =
    Math.floor(
      localY / cellHeight
    );

  return Object.freeze({
    row:
      pointerRow -
      anchorRow,

    col:
      pointerCol -
      anchorCol,

    pointerRow,
    pointerCol,
  });
}
