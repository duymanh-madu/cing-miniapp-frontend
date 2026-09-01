import test from "node:test";
import assert from "node:assert/strict";

import {
  CHARACTER_ANIMATION_RUNTIME_VERSION_V1,
  animationKeyFor,
  extractAtlasFrameNamesV1,
  registerCharacterAnimationsV1,
} from "../presentation/cingArtilleryCharacterAnimationsV1.js";

test(
  "character animation runtime version is explicit",
  () => {
    assert.equal(
      CHARACTER_ANIMATION_RUNTIME_VERSION_V1,
      "cing-artillery-character-animation-runtime-v1"
    );
  }
);

test(
  "animation key remains identity gender plus state",
  () => {
    assert.equal(
      animationKeyFor({
        gender:
          "female",
        state:
          "shoot",
      }),
      "cing-piu-piu-character-female-shoot-v1"
    );
  }
);

test(
  "atlas frame order is deterministic and excludes base frame",
  () => {
    const scene = {
      textures: {
        get() {
          return {
            getFrameNames() {
              return [
                "__BASE",
                "frame_10",
                "frame_2",
                "frame_1",
              ];
            },
          };
        },
      },
    };

    assert.deepEqual(
      [
        ...extractAtlasFrameNamesV1({
          scene,
          textureKey:
            "fixture",
        }),
      ],
      [
        "frame_1",
        "frame_2",
        "frame_10",
      ]
    );
  }
);

test(
  "registers exact commercial animation matrix from loaded atlases",
  () => {
    const created = [];

    const scene = {
      textures: {
        get() {
          return {
            getFrameNames() {
              return [
                "frame_000",
                "frame_001",
              ];
            },
          };
        },
      },

      anims: {
        exists() {
          return false;
        },

        create(config) {
          created.push(
            config
          );

          return config;
        },
      },
    };

    const registrations =
      registerCharacterAnimationsV1(
        scene
      );

    assert.equal(
      registrations.length,
      14
    );

    assert.equal(
      created.length,
      14
    );

    for (
      const config
      of created
    ) {
      assert.equal(
        config.frames.length,
        2
      );

      assert.equal(
        Number.isFinite(
          config.frameRate
        ),
        true
      );

      assert.equal(
        config.repeat === -1 ||
        config.repeat === 0,
        true
      );
    }
  }
);

test(
  "animation frame budget fails closed",
  () => {
    const scene = {
      textures: {
        get() {
          return {
            getFrameNames() {
              return Array.from(
                {
                  length:
                    20,
                },
                (_, index) =>
                  `frame_${String(
                    index
                  ).padStart(
                    3,
                    "0"
                  )}`
              );
            },
          };
        },
      },

      anims: {
        exists() {
          return false;
        },

        create() {}
      },
    };

    assert.throws(
      () =>
        registerCharacterAnimationsV1(
          scene
        ),
      /CHARACTER_ANIMATION_FRAME_BUDGET_EXCEEDED_V1/u
    );
  }
);
