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
  "drag layout is measured once at pointerdown",
  () => {
    const matches =
      component.match(
        /getBoundingClientRect/g
      ) || [];

    assert.equal(
      matches.length,
      1
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
