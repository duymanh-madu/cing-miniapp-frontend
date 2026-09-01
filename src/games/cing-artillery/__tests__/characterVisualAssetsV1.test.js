import assert from "node:assert/strict";
import test from "node:test";

import {
  CHARACTER_ANIMATION_STATES_V1,
  CHARACTER_GENDERS_V1,
  CHARACTER_VISUAL_ASSET_VERSION_V1,
  DEFAULT_CHARACTER_KEY_V1,
  resolveCharacterVisualAssetV1,
} from "../runtime/cingArtilleryCharacterVisualAssetsV1.js";

test(
  "commercial candidate V1 supports exactly seven required animation states",
  () => {
    assert.deepEqual(
      CHARACTER_ANIMATION_STATES_V1,
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

    assert.equal(
      Object.isFrozen(
        CHARACTER_ANIMATION_STATES_V1
      ),
      true
    );
  }
);

test(
  "production V1 identity uses canonical default character key",
  () => {
    assert.equal(
      DEFAULT_CHARACTER_KEY_V1,
      "default"
    );

    assert.deepEqual(
      CHARACTER_GENDERS_V1,
      [
        "male",
        "female",
      ]
    );
  }
);

test(
  "male visual bundle resolves from frozen identity",
  () => {
    const asset =
      resolveCharacterVisualAssetV1({
        character_key:
          "default",

        gender:
          "male",
      });

    assert.equal(
      asset.characterKey,
      "default"
    );

    assert.equal(
      asset.gender,
      "male"
    );

    assert.equal(
      asset.states.idle.atlasImage,
      "/game-assets/cing-piu-piu/characters/default/v1/male/idle.webp"
    );

    assert.equal(
      asset.states.victory.atlasData,
      "/game-assets/cing-piu-piu/characters/default/v1/male/victory.json"
    );

    assert.equal(
      Object.isFrozen(asset),
      true
    );
  }
);

test(
  "female visual bundle resolves from frozen identity",
  () => {
    const asset =
      resolveCharacterVisualAssetV1({
        character_key:
          "default",

        gender:
          "female",
      });

    assert.equal(
      asset.gender,
      "female"
    );

    assert.equal(
      asset.states.shoot.atlasImage,
      "/game-assets/cing-piu-piu/characters/default/v1/female/shoot.webp"
    );

    assert.equal(
      asset.states.defeat.atlasData,
      "/game-assets/cing-piu-piu/characters/default/v1/female/defeat.json"
    );
  }
);

test(
  "participant slot is not part of visual identity resolution",
  () => {
    const male =
      resolveCharacterVisualAssetV1({
        character_key:
          "default",

        gender:
          "male",
      });

    assert.equal(
      "participant_slot" in male,
      false
    );

    assert.equal(
      "player_one" in male,
      false
    );

    assert.equal(
      "player_two" in male,
      false
    );
  }
);

test(
  "unsupported character key fails closed",
  () => {
    assert.throws(
      () =>
        resolveCharacterVisualAssetV1({
          character_key:
            "unknown",

          gender:
            "male",
        }),
      /CHARACTER_VISUAL_ASSET_UNSUPPORTED_V1:character_key/u
    );
  }
);

test(
  "unsupported gender fails closed",
  () => {
    assert.throws(
      () =>
        resolveCharacterVisualAssetV1({
          character_key:
            "default",

          gender:
            "other",
        }),
      /CHARACTER_VISUAL_ASSET_UNSUPPORTED_V1:gender/u
    );
  }
);

test(
  "visual asset contract owns no gameplay authority",
  async () => {
    const fs =
      await import(
        "node:fs"
      );

    const source =
      fs.readFileSync(
        new URL(
          "../runtime/cingArtilleryCharacterVisualAssetsV1.js",
          import.meta.url
        ),
        "utf8"
      );

    for (const forbidden of [
      "position_x",
      "position_y",
      "motion_state",
      "damage",
      "terrain",
      "winner",
      "current_hp",
      "shot_command",
    ]) {
      assert.equal(
        source.includes(
          forbidden
        ),
        false,
        `forbidden gameplay authority token: ${forbidden}`
      );
    }
  }
);

test(
  "visual asset contract version remains explicit",
  () => {
    assert.equal(
      CHARACTER_VISUAL_ASSET_VERSION_V1,
      "cing-artillery-character-visual-assets-v1"
    );
  }
);
