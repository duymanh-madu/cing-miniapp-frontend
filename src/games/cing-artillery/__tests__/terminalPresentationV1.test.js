import assert from "node:assert/strict";
import test from "node:test";

import {
  TERMINAL_COMPLETION_REASON_V1,
  TERMINAL_PRESENTATION_VERSION_V1,
  projectTerminalPresentationV1,
} from "../domain/cingArtilleryTerminalPresentationV1.js";

const P1 =
  "11111111-1111-4111-8111-111111111111";

const P2 =
  "22222222-2222-4222-8222-222222222222";

function snapshot({
  viewer =
    P1,

  terminal =
    {
      status:
        "initialized",

      winner_account_id:
        null,

      loser_account_id:
        null,

      completion_reason:
        null,

      completed_at:
        null,
    },
} = {}) {
  return {
    viewer: {
      account_id:
        viewer,
    },

    players: {
      player_one: {
        account_id:
          P1,
      },

      player_two: {
        account_id:
          P2,
      },
    },

    terminal,
  };
}

test(
  "terminal presentation version is explicit",
  () => {
    assert.equal(
      TERMINAL_PRESENTATION_VERSION_V1,
      "cing-artillery-terminal-presentation-v1"
    );
  }
);

test(
  "initialized battle projects no result",
  () => {
    const result =
      projectTerminalPresentationV1(
        snapshot()
      );

    assert.equal(
      result.completed,
      false
    );

    assert.equal(
      result.viewerResult,
      null
    );
  }
);

test(
  "canonical winner projects viewer victory",
  () => {
    const result =
      projectTerminalPresentationV1(
        snapshot({
          terminal: {
            status:
              "completed",

            winner_account_id:
              P1,

            loser_account_id:
              P2,

            completion_reason:
              "hp_depleted",

            completed_at:
              "2026-09-02T03:00:00.000Z",
          },
        })
      );

    assert.equal(
      result.viewerResult,
      "victory"
    );

    assert.equal(
      result.completionReason,
      TERMINAL_COMPLETION_REASON_V1
        .HP_DEPLETED
    );
  }
);

test(
  "canonical loser projects viewer defeat",
  () => {
    const result =
      projectTerminalPresentationV1(
        snapshot({
          viewer:
            P2,

          terminal: {
            status:
              "completed",

            winner_account_id:
              P1,

            loser_account_id:
              P2,

            completion_reason:
              "fell_out_of_world",

            completed_at:
              "2026-09-02T03:00:00.000Z",
          },
        })
      );

    assert.equal(
      result.viewerResult,
      "defeat"
    );

    assert.equal(
      result.completionReason,
      TERMINAL_COMPLETION_REASON_V1
        .FELL_OUT_OF_WORLD
    );
  }
);

test(
  "terminal presentation rejects projectile out_of_bounds as match completion",
  () => {
    assert.throws(
      () =>
        projectTerminalPresentationV1(
          snapshot({
            terminal: {
              status:
                "completed",

              winner_account_id:
                P1,

              loser_account_id:
                P2,

              completion_reason:
                "out_of_bounds",

              completed_at:
                "2026-09-02T03:00:00.000Z",
            },
          })
        ),
      /TERMINAL_REASON_INVALID/u
    );
  }
);

test(
  "terminal presentation rejects incomplete completed authority",
  () => {
    assert.throws(
      () =>
        projectTerminalPresentationV1(
          snapshot({
            terminal: {
              status:
                "completed",

              winner_account_id:
                P1,

              loser_account_id:
                null,

              completion_reason:
                "hp_depleted",

              completed_at:
                "2026-09-02T03:00:00.000Z",
            },
          })
        )
    );
  }
);

test(
  "nonterminal snapshot cannot carry premature result authority",
  () => {
    assert.throws(
      () =>
        projectTerminalPresentationV1(
          snapshot({
            terminal: {
              status:
                "initialized",

              winner_account_id:
                P1,

              loser_account_id:
                null,

              completion_reason:
                null,

              completed_at:
                null,
            },
          })
        ),
      /NONTERMINAL_AUTHORITY_INVALID/u
    );
  }
);

test(
  "terminal presentation owns no HP fall or projectile inference",
  async () => {
    const source =
      await import(
        "node:fs/promises"
      ).then(
        fs =>
          fs.readFile(
            new URL(
              "../domain/cingArtilleryTerminalPresentationV1.js",
              import.meta.url
            ),
            "utf8"
          )
      );

    for (const forbidden of [
      "current_hp",
      "motion_state",
      "target_account_id",
      "trajectory",
      "damage",
    ]) {
      assert.equal(
        source.includes(
          forbidden
        ),
        false,
        forbidden
      );
    }
  }
);
