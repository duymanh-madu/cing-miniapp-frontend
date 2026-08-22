import test from
  "node:test";

import assert from
  "node:assert/strict";

import fs from
  "node:fs";

import path from
  "node:path";

const component =
  fs.readFileSync(
    path.join(
      process.cwd(),
      "src/games/cing-block-puzzle/CingBlockPuzzle.jsx"
    ),
    "utf8"
  );

const css =
  fs.readFileSync(
    path.join(
      process.cwd(),
      "src/games/cing-block-puzzle/CingBlockPuzzle.css"
    ),
    "utf8"
  );

test(
  "magnetic drag performs exactly two pointerdown layout measurements",
  () => {
    const matches =
      component.match(
        /getBoundingClientRect/g
      ) || [];

    /*
     * One tray-slot measurement resolves the nearest
     * occupied magnetic anchor. One board measurement
     * caches drop geometry. pointermove performs neither.
     */
    assert.equal(
      matches.length,
      2
    );

    assert.match(
      component,
      /resolveNearestPieceAnchor/
    );

    assert.match(
      component,
      /Cache layout exactly once at pointerdown/
    );
  }
);

test(
  "floating piece movement is scheduled with requestAnimationFrame",
  () => {
    assert.match(
      component,
      /requestAnimationFrame/
    );

    assert.match(
      component,
      /cancelAnimationFrame/
    );

    assert.match(
      component,
      /floatingPieceRef/
    );

    assert.match(
      component,
      /translate3d/
    );
  }
);

test(
  "raw pointermove does not use functional setDrag loop",
  () => {
    assert.doesNotMatch(
      component,
      /setDrag\(\s*\(\s*current\s*\)\s*=>/
    );

    assert.match(
      component,
      /React updates only when the board target/
    );
  }
);

test(
  "active pointer gesture has explicit cleanup authority",
  () => {
    assert.match(
      component,
      /dragCleanupRef/
    );

    assert.match(
      component,
      /releasePointerCapture/
    );

    assert.match(
      component,
      /pointercancel/
    );
  }
);

test(
  "Block Puzzle uses GPU-friendly 3D visual cells",
  () => {
    assert.match(
      component,
      /CingBlockPuzzle\.css/
    );

    assert.match(
      css,
      /cing-block-puzzle__floating-piece/
    );

    assert.match(
      css,
      /will-change:\s*transform/
    );

    assert.match(
      css,
      /translate3d/
    );

    assert.match(
      css,
      /cing-block-puzzle__board-cell--filled/
    );

    assert.match(
      css,
      /cing-block-puzzle__piece-cell/
    );
  }
);

test(
  "occupied board skin overrides empty board skin by cascade order",
  () => {
    const emptyIndex =
      css.indexOf(
        ".cing-block-puzzle__board-cell {"
      );

    const filledIndex =
      css.indexOf(
        ".cing-block-puzzle__board-cell--filled {"
      );

    const validPreviewIndex =
      css.indexOf(
        ".cing-block-puzzle__board-cell--preview-valid {"
      );

    const invalidPreviewIndex =
      css.indexOf(
        ".cing-block-puzzle__board-cell--preview-invalid {"
      );

    assert.ok(
      emptyIndex >= 0
    );

    assert.ok(
      filledIndex >
        emptyIndex
    );

    assert.ok(
      validPreviewIndex >
        filledIndex
    );

    assert.ok(
      invalidPreviewIndex >
        filledIndex
    );
  }
);

test(
  "tray piece uses whole-slot magnetic pointer hitbox",
  () => {
    assert.match(
      component,
      /cing-block-puzzle__piece-hitbox/
    );

    assert.match(
      component,
      /resolveNearestPieceAnchor/
    );

    assert.doesNotMatch(
      component,
      /role="button"\s*[\s\S]*?onPointerDown=\{\s*disabled/
    );
  }
);

test(
  "premium block skin uses layered bevel without filter effects",
  () => {
    assert.match(
      css,
      /radial-gradient/
    );

    assert.match(
      css,
      /inset 0 -5px 0/
    );

    assert.match(
      css,
      /board-cell--filled::after/
    );

    assert.doesNotMatch(
      css,
      /\bfilter\s*:/
    );
  }
);
