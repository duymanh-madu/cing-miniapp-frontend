import test from
  "node:test";

import assert from
  "node:assert/strict";

import fs from
  "node:fs";

import path from
  "node:path";

const source =
  fs.readFileSync(
    path.join(
      process.cwd(),
      "src/games/cing-block-puzzle/runtime/blockPuzzleAuthorityClient.js"
    ),
    "utf8"
  );

test(
  "authority client uses dedicated Block Puzzle session endpoints",
  () => {
    assert.match(
      source,
      /\/game\/cing-block-puzzle/
    );

    assert.match(
      source,
      /\/session/
    );

    assert.match(
      source,
      /\/submit/
    );
  }
);

test(
  "authority client never uses generic play or score endpoints",
  () => {
    assert.doesNotMatch(
      source,
      /\/game\/use-play/
    );

    assert.doesNotMatch(
      source,
      /\/game\/score/
    );
  }
);

test(
  "start request sends request_id authority key",
  () => {
    assert.match(
      source,
      /request_id/
    );
  }
);

test(
  "submit body contains replay authority",
  () => {
    assert.match(
      source,
      /\{\s*replay,\s*\}/
    );
  }
);

test(
  "authority client never submits client identity or score fields",
  () => {
    const postBodies = [
      ...source.matchAll(
        /apiClient\.post\([\s\S]*?\n\s*\{([\s\S]*?)\n\s*\},\n\s*\n\s*authConfig\(\)/g
      ),
    ].map(
      (match) => match[1]
    );

    assert.equal(
      postBodies.length,
      2
    );

    for (const body of postBodies) {
      assert.doesNotMatch(
        body,
        /\buser_id\b/
      );

      assert.doesNotMatch(
        body,
        /\bplayer_name\b/
      );

      assert.doesNotMatch(
        body,
        /\bavatar\b/
      );

      assert.doesNotMatch(
        body,
        /\bscore\b/
      );

      assert.doesNotMatch(
        body,
        /\bverified_score\b/
      );
    }
  }
);

test(
  "authority requests use canonical authenticated access token",
  () => {
    assert.match(
      source,
      /getCanonicalAccessToken/
    );

    assert.match(
      source,
      /Authorization/
    );

    assert.match(
      source,
      /Bearer \$\{token\}/
    );

    assert.doesNotMatch(
      source,
      /useAuthStore/
    );
  }
);

test(
  "client never generates gameplay seed",
  () => {
    assert.doesNotMatch(
      source,
      /randomBytes/
    );

    assert.doesNotMatch(
      source,
      /Math\.random/
    );

    assert.doesNotMatch(
      source,
      /seed\s*:\s*Math/
    );
  }
);
