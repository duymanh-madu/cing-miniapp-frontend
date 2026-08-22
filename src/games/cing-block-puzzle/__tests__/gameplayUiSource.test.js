import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const component =
  fs.readFileSync(
    path.join(
      process.cwd(),
      "src/games/cing-block-puzzle/CingBlockPuzzle.jsx"
    ),
    "utf8"
  );

test(
  "gameplay UI uses dedicated session authority",
  () => {
    assert.match(
      component,
      /startAuthorizedBlockPuzzleSession/
    );

    assert.match(
      component,
      /submitAuthorizedBlockPuzzleReplay/
    );

    assert.match(
      component,
      /createAuthorizedBlockPuzzleRuntime/
    );

    assert.match(
      component,
      /applyAuthorizedBlockPuzzleMove/
    );
  }
);

test(
  "gameplay UI never calls generic economy or score endpoints",
  () => {
    assert.doesNotMatch(
      component,
      /\/game\/use-play/
    );

    assert.doesNotMatch(
      component,
      /\/game\/score/
    );
  }
);

test(
  "start retry preserves the same request id",
  () => {
    assert.match(
      component,
      /requestIdRef/
    );

    assert.match(
      component,
      /if\s*\(\s*!requestIdRef\.current\s*\)/
    );

    assert.match(
      component,
      /requestId:\s*requestIdRef/
    );
  }
);

test(
  "submit retry preserves exact session and replay",
  () => {
    assert.match(
      component,
      /sessionId:\s*terminalRuntime/
    );

    assert.match(
      component,
      /replay:\s*terminalRuntime/
    );

    assert.match(
      component,
      /submitRuntime\(\s*runtimeRef/
    );
  }
);

test(
  "gameplay state changes only through authorized runtime move",
  () => {
    assert.match(
      component,
      /applyAuthorizedBlockPuzzleMove/
    );

    assert.doesNotMatch(
      component,
      /applyMove\s*\(/
    );
  }
);

test(
  "final result renders server-authoritative finalScore",
  () => {
    assert.match(
      component,
      /runtime\s*\.finalScore/
    );

    assert.match(
      component,
      /applyAuthoritativeBlockPuzzleSubmission/
    );
  }
);
