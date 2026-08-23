import test from "node:test";
import assert from "node:assert/strict";

import {
  normalizeAuthorizedSession,
} from "../runtime/blockPuzzleAuthorityContracts.js";

function authorizedSession(
  overrides = {}
) {
  return {
    session_id:
      "11111111-1111-4111-8111-111111111111",

    seed:
      20260823,

    engine_version: 2,
    rules_version: 2,
    score_version: 2,
    replay_version: 3,

    play_cost: 1,

    expires_at:
      "2099-08-23T08:00:00.000Z",

    ...overrides,
  };
}

test(
  "authority client accepts exact replay V3 authorized session",
  () => {
    const session =
      normalizeAuthorizedSession(
        authorizedSession()
      );

    assert.equal(
      session.engine_version,
      2
    );

    assert.equal(
      session.rules_version,
      2
    );

    assert.equal(
      session.score_version,
      2
    );

    assert.equal(
      session.replay_version,
      3
    );
  }
);

test(
  "authority client preserves exact V2 legacy session after V3 activation",
  () => {
    const session =
      normalizeAuthorizedSession(
        authorizedSession({
          replay_version: 2,
        })
      );

    assert.equal(
      session.replay_version,
      2
    );
  }
);

test(
  "authority client rejects mixed V3 session tuple",
  () => {
    assert.throws(
      () =>
        normalizeAuthorizedSession(
          authorizedSession({
            rules_version: 1,
          })
        ),
      (error) =>
        error?.code ===
        "BLOCK_PUZZLE_SESSION_VERSION_MISMATCH"
    );
  }
);
