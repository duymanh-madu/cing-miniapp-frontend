import test from
  "node:test";

import assert from
  "node:assert/strict";

import {
  normalizeAuthorizedSession,
} from "../runtime/blockPuzzleAuthorityContracts.js";

function session(
  version
) {
  return {
    session_id:
      "11111111-1111-4111-8111-111111111111",

    seed:
      20260823,

    engine_version:
      version,

    rules_version:
      version,

    score_version:
      version,

    replay_version:
      version,

    play_cost:
      1,

    expires_at:
      "2099-08-23T00:00:00.000Z",
  };
}

test(
  "authority client accepts exact V1 authorized session",
  () => {
    const normalized =
      normalizeAuthorizedSession(
        session(1)
      );

    assert.equal(
      normalized.engine_version,
      1
    );

    assert.equal(
      normalized.replay_version,
      1
    );
  }
);

test(
  "authority client accepts exact V2 authorized session",
  () => {
    const normalized =
      normalizeAuthorizedSession(
        session(2)
      );

    assert.equal(
      normalized.engine_version,
      2
    );

    assert.equal(
      normalized.rules_version,
      2
    );

    assert.equal(
      normalized.score_version,
      2
    );

    assert.equal(
      normalized.replay_version,
      2
    );
  }
);

test(
  "authority client rejects mixed deterministic session contract",
  () => {
    assert.throws(
      () =>
        normalizeAuthorizedSession({
          ...session(2),

          rules_version:
            1,
        }),

      (error) =>
        error?.code ===
        "BLOCK_PUZZLE_SESSION_VERSION_MISMATCH"
    );
  }
);
