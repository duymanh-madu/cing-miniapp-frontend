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

    trajectory_presentation: {
      presentation_version: 1,
      physics_fixed_scale: "1000",
      sample_stride: 2,
      sample_count: 3,
      samples: [
        {
          step_index: 0,
          elapsed_ms: 0,
          x_scaled: "100000",
          y_scaled: "200000",
        },
        {
          step_index: 2,
          elapsed_ms: 32,
          x_scaled: "200000",
          y_scaled: "160000",
        },
        {
          step_index: 4,
          elapsed_ms: 64,
          x_scaled: "280000",
          y_scaled: "145000",
        },
      ],
    },

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

test(
  "projects durable server trajectory without deriving ballistic physics",
  () => {
    const result =
      projectCanonicalResultV1(
        row()
      );

    assert.equal(
      result.trajectory_presentation
        .presentation_version,
      1
    );

    assert.equal(
      result.trajectory_presentation
        .physics_fixed_scale,
      "1000"
    );

    assert.equal(
      result.trajectory_presentation
        .sample_count,
      3
    );

    assert.deepEqual(
      result.trajectory_presentation.samples.map(
        (sample) => ({
          step_index:
            sample.step_index,
          elapsed_ms:
            sample.elapsed_ms,
          x_scaled:
            sample.x_scaled,
          y_scaled:
            sample.y_scaled,
          x:
            sample.x,
          y:
            sample.y,
        })
      ),
      [
        {
          step_index: 0,
          elapsed_ms: 0,
          x_scaled: "100000",
          y_scaled: "200000",
          x: 100,
          y: 200,
        },
        {
          step_index: 2,
          elapsed_ms: 32,
          x_scaled: "200000",
          y_scaled: "160000",
          x: 200,
          y: 160,
        },
        {
          step_index: 4,
          elapsed_ms: 64,
          x_scaled: "280000",
          y_scaled: "145000",
          x: 280,
          y: 145,
        },
      ]
    );

    assert.ok(
      Object.isFrozen(
        result.trajectory_presentation
      )
    );

    assert.ok(
      Object.isFrozen(
        result.trajectory_presentation.samples
      )
    );

    assert.ok(
      Object.isFrozen(
        result.trajectory_presentation.samples[0]
      )
    );
  }
);

test(
  "fails closed when durable trajectory is missing",
  () => {
    assert.throws(
      () =>
        projectCanonicalResultV1(
          row({
            trajectory_presentation:
              null,
          })
        ),
      /CANONICAL_RESULT_INVALID_V1/u
    );
  }
);

test(
  "fails closed when durable trajectory sample order is invalid",
  () => {
    assert.throws(
      () =>
        projectCanonicalResultV1(
          row({
            trajectory_presentation: {
              presentation_version: 1,
              physics_fixed_scale: "1000",
              sample_stride: 2,
              sample_count: 2,
              samples: [
                {
                  step_index: 0,
                  elapsed_ms: 0,
                  x_scaled: "100000",
                  y_scaled: "200000",
                },
                {
                  step_index: 0,
                  elapsed_ms: 32,
                  x_scaled: "120000",
                  y_scaled: "190000",
                },
              ],
            },
          })
        ),
      /CANONICAL_RESULT_INVALID_V1:trajectory_presentation\.samples/u
    );
  }
);

test(
  "fails closed when durable trajectory exceeds bounded sample contract",
  () => {
    const samples =
      Array.from(
        {
          length: 257,
        },
        (_, index) => ({
          step_index:
            index,
          elapsed_ms:
            index * 16,
          x_scaled:
            String(
              100000 +
              index
            ),
          y_scaled:
            "200000",
        })
      );

    assert.throws(
      () =>
        projectCanonicalResultV1(
          row({
            trajectory_presentation: {
              presentation_version: 1,
              physics_fixed_scale: "1000",
              sample_stride: 1,
              sample_count: 257,
              samples,
            },
          })
        ),
      /CANONICAL_RESULT_INVALID_V1:trajectory_presentation\.samples/u
    );
  }
);
