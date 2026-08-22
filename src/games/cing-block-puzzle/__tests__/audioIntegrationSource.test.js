import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const component =
  fs.readFileSync(
    new URL(
      "../CingBlockPuzzle.jsx",
      import.meta.url
    ),
    "utf8"
  );

test(
  "Block Puzzle unlocks WebAudio from synchronous user gestures",
  () => {
    assert.match(
      component,
      /blockPuzzleAudioRuntime\s*\.\s*unlockFromGesture\s*\(\s*\)/
    );
  }
);

test(
  "Block Puzzle audio consumes exact presentation event",
  () => {
    assert.match(
      component,
      /blockPuzzleAudioRuntime\s*\.\s*playMoveEvent\s*\(\s*event\s*\)/
    );
  }
);

test(
  "Block Puzzle music follows document visibility lifecycle",
  () => {
    assert.match(
      component,
      /visibilitychange/
    );

    assert.match(
      component,
      /blockPuzzleAudioRuntime\s*\.\s*suspend\s*\(\s*\)/
    );

    assert.match(
      component,
      /blockPuzzleAudioRuntime\s*\.\s*resume\s*\(\s*\)/
    );

    assert.match(
      component,
      /blockPuzzleAudioRuntime\s*\.\s*stopMusic\s*\(\s*\)/
    );
  }
);
