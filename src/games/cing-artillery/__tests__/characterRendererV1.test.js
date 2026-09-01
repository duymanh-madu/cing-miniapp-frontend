import assert from "node:assert/strict";
import test from "node:test";

import {
  CHARACTER_RENDERER_VERSION_V1,
  CHARACTER_RENDER_SCALE_V1,
  textureKeyFor,
} from "../presentation/cingArtilleryCharacterRendererV1.js";

import {
  CHARACTER_PRELOAD_VERSION_V1,
} from "../presentation/cingArtilleryCharacterPreloadV1.js";

test(
  "commercial character runtime versions are explicit",
  () => {
    assert.equal(
      CHARACTER_RENDERER_VERSION_V1,
      "cing-artillery-character-renderer-v1"
    );

    assert.equal(
      CHARACTER_PRELOAD_VERSION_V1,
      "cing-artillery-character-preload-v1"
    );
  }
);

test(
  "character texture keys are identity based not participant-slot based",
  () => {
    assert.equal(
      textureKeyFor({
        gender:
          "male",

        state:
          "idle",
      }),
      "cing-piu-piu-character-male-idle-v1"
    );

    assert.equal(
      textureKeyFor({
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
  "commercial character render scale is bounded for 960x540 world",
  () => {
    assert.equal(
      CHARACTER_RENDER_SCALE_V1 >
        0,
      true
    );

    assert.equal(
      CHARACTER_RENDER_SCALE_V1 <
        0.5,
      true
    );
  }
);

test(
  "renderer source owns no gameplay authority",
  async () => {
    const fs =
      await import(
        "node:fs"
      );

    const source =
      fs.readFileSync(
        new URL(
          "../presentation/cingArtilleryCharacterRendererV1.js",
          import.meta.url
        ),
        "utf8"
      );

    for (const forbidden of [
      "damage",
      "trajectory",
      "hitbox",
      "crater",
      "wind_force",
      "current_hp",
      "terrain_revision",
      "winner_account",
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

test(
  "preload consumes resolver atlasImage and atlasData exactly",
  async () => {
    const {
      preloadCharacterAssetsV1,
    } =
      await import(
        "../presentation/cingArtilleryCharacterPreloadV1.js"
      );

    const calls = [];

    const scene = {
      load: {
        atlas(
          key,
          image,
          atlas
        ) {
          calls.push({
            key,
            image,
            atlas,
          });
        },
      },
    };

    const registrations =
      preloadCharacterAssetsV1(
        scene
      );

    assert.equal(
      calls.length,
      14
    );

    assert.equal(
      registrations.length,
      14
    );

    for (
      const registration
      of registrations
    ) {
      assert.equal(
        typeof registration.image,
        "string"
      );

      assert.equal(
        typeof registration.atlas,
        "string"
      );

      assert.equal(
        registration.image.endsWith(
          ".webp"
        ),
        true
      );

      assert.equal(
        registration.atlas.endsWith(
          ".json"
        ),
        true
      );

      assert.equal(
        registration.image.includes(
          "undefined"
        ),
        false
      );

      assert.equal(
        registration.atlas.includes(
          "undefined"
        ),
        false
      );
    }
  }
);

test(
  "commercial renderer requires registered production animation",
  async () => {
    const fs =
      await import(
        "node:fs/promises"
      );

    const source =
      await fs.readFile(
        new URL(
          "../presentation/cingArtilleryCharacterRendererV1.js",
          import.meta.url
        ),
        "utf8"
      );

    assert.match(
      source,
      /CHARACTER_RENDERER_ANIMATION_MISSING_V1/u
    );

    assert.match(
      source,
      /sprite\.play/u
    );
  }
);
