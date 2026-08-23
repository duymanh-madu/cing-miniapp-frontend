import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source =
  fs.readFileSync(
    new URL(
      "../runtime/blockPuzzleSessionRuntime.js",
      import.meta.url
    ),
    "utf8"
  );

test(
  "runtime move count supports legacy moves and replay V3 events",
  () => {
    assert.match(
      source,
      /function getReplayMoveCount/
    );

    assert.match(
      source,
      /Array\.isArray\([\s\S]*replay\?\.moves/
    );

    assert.match(
      source,
      /Array\.isArray\([\s\S]*replay\?\.events/
    );

    assert.match(
      source,
      /event\?\.type === "move"/
    );

    assert.match(
      source,
      /getReplayMoveCount\(replay\)/
    );

    assert.match(
      source,
      /getReplayMoveCount\(runtime\.replay\)/
    );

    assert.doesNotMatch(
      source,
      /runtime\.replay\.moves\.length/
    );
  }
);
