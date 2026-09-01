import assert from "node:assert/strict";
import test from "node:test";

import {
  CHARACTER_CONTROLLER_VERSION_V1,
  CHARACTER_STATE_V1,
  CHARACTER_STATES_V1,
  assertCharacterStateV1,
  createCharacterPresentationControllerV1,
} from "../presentation/cingArtilleryCharacterControllerV1.js";

function createFakeContainer() {
  return {
    setPosition() {
      return this;
    },

    setAngle() {
      return this;
    },

    setAlpha() {
      return this;
    },
  };
}

function createFakeIndicator() {
  return {
    alpha:
      null,

    setAlpha(
      value
    ) {
      this.alpha =
        value;

      return this;
    },
  };
}

function createFrozenIdentity(
  slot =
    "player_one"
) {
  return Object.freeze({
    version:
      "cing-artillery-character-presentation-v1",

    participant_slot:
      slot,

    character_key:
      "default",

    character_name:
      "Cing Hero",

    gender:
      slot ===
        "player_one"
        ? "male"
        : "female",
  });
}

test(
  "character controller version is explicit",
  () => {
    assert.equal(
      CHARACTER_CONTROLLER_VERSION_V1,
      "cing-artillery-character-controller-v1"
    );
  }
);

test(
  "character controller supports exactly seven commercial states",
  () => {
    assert.deepEqual(
      CHARACTER_STATES_V1,
      [
        "idle",
        "aim",
        "shoot",
        "hit",
        "fall",
        "victory",
        "defeat",
      ]
    );
  }
);

test(
  "character state contract fails closed",
  () => {
    assert.equal(
      assertCharacterStateV1(
        CHARACTER_STATE_V1.AIM
      ),
      "aim"
    );

    assert.throws(
      () =>
        assertCharacterStateV1(
          "running"
        ),
      /CHARACTER_PRESENTATION_STATE_INVALID_V1/u
    );
  }
);

test(
  "controller preserves canonical motion container identity",
  () => {
    const container =
      createFakeContainer();

    const controller =
      createCharacterPresentationControllerV1({
        container,

        activeIndicator:
          createFakeIndicator(),
      });

    assert.equal(
      controller.container,
      container
    );
  }
);

test(
  "controller consumes frozen character presentation",
  () => {
    const controller =
      createCharacterPresentationControllerV1({
        container:
          createFakeContainer(),

        activeIndicator:
          createFakeIndicator(),
      });

    const identity =
      createFrozenIdentity();

    assert.equal(
      controller.bindIdentity(
        identity
      ),
      identity
    );

    assert.equal(
      controller.getIdentity(),
      identity
    );
  }
);

test(
  "controller rejects mutable or malformed identity",
  () => {
    const controller =
      createCharacterPresentationControllerV1({
        container:
          createFakeContainer(),

        activeIndicator:
          createFakeIndicator(),
      });

    assert.throws(
      () =>
        controller.bindIdentity({
          participant_slot:
            "player_one",

          character_key:
            "default",

          character_name:
            "Mutable",

          gender:
            "male",
        }),
      /CHARACTER_PRESENTATION_IDENTITY_INVALID_V1/u
    );

    assert.throws(
      () =>
        controller.bindIdentity(
          Object.freeze({
            participant_slot:
              "player_one",

            character_key:
              "default",

            character_name:
              "Broken",

            gender:
              "other",
          })
        ),
      /CHARACTER_PRESENTATION_IDENTITY_INVALID_V1/u
    );
  }
);

test(
  "active presentation is visual only",
  () => {
    const indicator =
      createFakeIndicator();

    const controller =
      createCharacterPresentationControllerV1({
        container:
          createFakeContainer(),

        activeIndicator:
          indicator,
      });

    controller.setActive(
      true
    );

    assert.equal(
      indicator.alpha,
      1
    );

    controller.setActive(
      false
    );

    assert.equal(
      indicator.alpha,
      0.32
    );
  }
);

test(
  "controller source owns no gameplay authority",
  async () => {
    const fs =
      await import(
        "node:fs"
      );

    const source =
      fs.readFileSync(
        new URL(
          "../presentation/cingArtilleryCharacterControllerV1.js",
          import.meta.url
        ),
        "utf8"
      );

    for (const forbidden of [
      "damage",
      "trajectory",
      "hitbox",
      "crater",
      "current_hp",
      "wind_force",
      "winner_account",
      "terrain_revision",
      "support_state",
    ]) {
      assert.equal(
        source.includes(
          forbidden
        ),
        false,
        `forbidden gameplay authority: ${forbidden}`
      );
    }
  }
);
