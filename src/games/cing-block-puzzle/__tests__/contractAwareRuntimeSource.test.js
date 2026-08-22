import test from
  "node:test";

import assert from
  "node:assert/strict";

import fs from
  "node:fs";

import path from
  "node:path";

function read(
  relative
) {
  return fs.readFileSync(
    path.join(
      process.cwd(),
      relative
    ),
    "utf8"
  );
}

const authority =
  read(
    "src/games/cing-block-puzzle/runtime/blockPuzzleAuthorityClient.js"
  );

const recovery =
  read(
    "src/games/cing-block-puzzle/runtime/blockPuzzleRecovery.js"
  );

test(
  "authority client resolves deterministic engine through registry",
  () => {
    assert.match(
      authority,
      /getBlockPuzzleEngineForContract/
    );

    assert.doesNotMatch(
      authority,
      /from "\.\.\/engine\/index\.js"/
    );

    assert.doesNotMatch(
      authority,
      /\bENGINE_VERSION\b/
    );

    assert.doesNotMatch(
      authority,
      /\bRULES_VERSION\b/
    );

    assert.doesNotMatch(
      authority,
      /\bSCORE_VERSION\b/
    );

    assert.doesNotMatch(
      authority,
      /\blocalReplayVersion\b/
    );
  }
);

test(
  "submit validation dispatches replay contract through registry",
  () => {
    assert.match(
      authority,
      /replay\.engineVersion/
    );

    assert.match(
      authority,
      /replay\.rulesVersion/
    );

    assert.match(
      authority,
      /replay\.scoreVersion/
    );

    assert.match(
      authority,
      /replay\.replayVersion/
    );

    assert.match(
      authority,
      /replayEngine\.validateReplayTranscript/
    );
  }
);

test(
  "recovery validates persisted replay through session-selected engine",
  () => {
    assert.match(
      recovery,
      /getBlockPuzzleEngineForContract/
    );

    assert.match(
      recovery,
      /engine\.validateReplayTranscript/
    );

    assert.doesNotMatch(
      recovery,
      /from "\.\.\/engine\/index\.js"/
    );
  }
);

test(
  "HTTP authority client delegates session normalization to pure contract module",
  () => {
    assert.match(
      authority,
      /blockPuzzleAuthorityContracts\.js/
    );

    assert.match(
      authority,
      /normalizeAuthorizedSession/
    );

    assert.doesNotMatch(
      authority,
      /export function\s+normalizeAuthorizedSession/
    );
  }
);
