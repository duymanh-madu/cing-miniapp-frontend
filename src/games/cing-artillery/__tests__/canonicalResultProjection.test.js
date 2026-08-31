import assert from "node:assert/strict";
import test from "node:test";

import {
  projectCanonicalResultV1,
} from "../domain/cingArtilleryCanonicalResultProjectionV1.js";

function row(
  overrides = {}
) {
  return {
    result_sequence: "90071992547409930",
    resolution_id: "resolution-1",
    execution_id: "execution-1",
    shot_command_id: "command-1",
    combat_state_id: "combat-1",
    turn_state_id: "turn-1",
    match_runtime_id: "runtime-1",
    match_id: "match-1",
    turn_number: 7,
    physics_version: 2,
    outcome: "terrain_hit",

    impact_exact_version: 1,
    impact_physics_fixed_scale: "1000",

    impact_start_x_scaled: "100000",
    impact_start_y_scaled: "200000",
    impact_delta_x_scaled: "400000",
    impact_delta_y_scaled: "-100000",

    impact_contact_kind: "rational",
    impact_contact_numerator: "1",
    impact_contact_denominator: "2",
    impact_contact_a: null,
    impact_contact_b: null,
    impact_contact_discriminant: null,

    impact_projection_version: 1,
    impact_x: "300",
    impact_y: "150",

    target_account_id: null,
    damage: "0",

    resolved_at:
      "2026-08-31T00:00:00.000Z",
    resolution_created_at:
      "2026-08-31T00:00:00.000Z",
    stream_created_at:
      "2026-08-31T00:00:00.000Z",

    ...overrides,
  };
}

test(
  "preserves canonical bigint text and creates presentation geometry",
  () => {
    const result =
      projectCanonicalResultV1(
        row()
      );

    assert.equal(
      result.result_sequence,
      "90071992547409930"
    );

    assert.equal(
      result.canonical.start_x_scaled,
      "100000"
    );

    assert.deepEqual(
      result.presentation,
      {
        start_x: 100,
        start_y: 200,
        delta_x: 400,
        delta_y: -100,
        contact_t: 0.5,
        impact_x: 300,
        impact_y: 150,
      }
    );
  }
);

test(
  "never converts durable result sequence into Number authority",
  () => {
    const result =
      projectCanonicalResultV1(
        row({
          result_sequence:
            "9223372036854775807",
        })
      );

    assert.equal(
      typeof result.result_sequence,
      "string"
    );

    assert.equal(
      result.result_sequence,
      "9223372036854775807"
    );
  }
);

test(
  "fails closed on unsupported outcome",
  () => {
    assert.throws(
      () =>
        projectCanonicalResultV1(
          row({
            outcome:
              "client_guessed_hit",
          })
        ),
      /CANONICAL_RESULT_INVALID_V1:outcome/u
    );
  }
);

test(
  "fails closed on malformed exact contact pair",
  () => {
    assert.throws(
      () =>
        projectCanonicalResultV1(
          row({
            impact_contact_denominator:
              null,
          })
        ),
      /CANONICAL_RESULT_INVALID_V1:impact_contact_parameter/u
    );
  }
);

test(
  "accepts canonical player hit target and damage without deriving them",
  () => {
    const result =
      projectCanonicalResultV1(
        row({
          outcome:
            "player_hit",
          target_account_id:
            "account-2",
          damage:
            "300",
        })
      );

    assert.equal(
      result.target_account_id,
      "account-2"
    );

    assert.equal(
      result.damage,
      "300"
    );
  }
);
