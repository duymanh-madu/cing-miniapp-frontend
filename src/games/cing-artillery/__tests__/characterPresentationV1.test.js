import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import {
  CHARACTER_PRESENTATION_VERSION_V1,
  PARTICIPANT_SLOTS_V1,
  projectCharacterPresentationV1,
} from "../domain/cingArtilleryCharacterPresentationV1.js";

function canonicalPlayer({
  character = {},
} = {}) {
  return {
    account_id:
      "11111111-1111-4111-8111-111111111111",

    position_x:
      100,

    position_y:
      200,

    character: {
      character_key:
        "cing-human-base-male",

      character_name:
        "Cing Nam",

      gender:
        "male",

      ...character,
    },
  };
}

test(
  "character presentation projects frozen battle identity",
  () => {
    const projected =
      projectCharacterPresentationV1({
        slot:
          "player_one",

        player:
          canonicalPlayer(),
      });

    assert.deepEqual(
      projected,
      {
        version:
          CHARACTER_PRESENTATION_VERSION_V1,

        participant_slot:
          "player_one",

        character_key:
          "cing-human-base-male",

        character_name:
          "Cing Nam",

        gender:
          "male",
      }
    );

    assert.equal(
      Object.isFrozen(projected),
      true
    );
  }
);

test(
  "participant slot contract is exact and immutable",
  () => {
    assert.deepEqual(
      PARTICIPANT_SLOTS_V1,
      [
        "player_one",
        "player_two",
      ]
    );

    assert.equal(
      Object.isFrozen(
        PARTICIPANT_SLOTS_V1
      ),
      true
    );
  }
);

test(
  "character identity is independent from participant slot",
  () => {
    const player =
      canonicalPlayer({
        character: {
          character_key:
            "cing-human-base-female",

          character_name:
            "Cing Nữ",

          gender:
            "female",
        },
      });

    const one =
      projectCharacterPresentationV1({
        slot:
          "player_one",

        player,
      });

    const two =
      projectCharacterPresentationV1({
        slot:
          "player_two",

        player,
      });

    assert.equal(
      one.gender,
      "female"
    );

    assert.equal(
      two.gender,
      "female"
    );

    assert.equal(
      one.character_key,
      two.character_key
    );
  }
);

test(
  "character presentation fails closed without frozen character",
  () => {
    assert.throws(
      () =>
        projectCharacterPresentationV1({
          slot:
            "player_one",

          player: {
            account_id:
              "11111111-1111-4111-8111-111111111111",
          },
        }),
      /CHARACTER_PRESENTATION_INVALID_V1:character/u
    );
  }
);

test(
  "character presentation rejects invalid participant slot",
  () => {
    assert.throws(
      () =>
        projectCharacterPresentationV1({
          slot:
            "spectator",

          player:
            canonicalPlayer(),
        }),
      /CHARACTER_PRESENTATION_INVALID_V1:participant_slot/u
    );
  }
);

test(
  "character presentation rejects noncanonical identity strings",
  () => {
    for (
      const [field, value]
      of [
        ["character_key", ""],
        ["character_name", " Cing Nam"],
        ["gender", "male "],
      ]
    ) {
      assert.throws(
        () =>
          projectCharacterPresentationV1({
            slot:
              "player_one",

            player:
              canonicalPlayer({
                character: {
                  [field]:
                    value,
                },
              }),
          }),
        new RegExp(
          `CHARACTER_PRESENTATION_INVALID_V1:${field}`,
          "u"
        )
      );
    }
  }
);

test(
  "BattleScene consumes character from canonical snapshot players",
  () => {
    const source =
      fs.readFileSync(
        new URL(
          "../scenes/BattleScene.js",
          import.meta.url
        ),
        "utf8"
      );

    assert.match(
      source,
      /projectCharacterPresentationV1/u
    );

    assert.match(
      source,
      /player:\s*playerOne/u
    );

    assert.match(
      source,
      /player:\s*playerTwo/u
    );

    assert.match(
      source,
      /this\.characterPresentation\s*=/u
    );

    assert.match(
      source,
      /player_one:\s*playerOneCharacter/u
    );

    assert.match(
      source,
      /player_two:\s*playerTwoCharacter/u
    );
  }
);

test(
  "BattleScene does not choose identity from player slot",
  () => {
    const source =
      fs.readFileSync(
        new URL(
          "../scenes/BattleScene.js",
          import.meta.url
        ),
        "utf8"
      );

    assert.doesNotMatch(
      source,
      /player_one[\s\S]{0,120}(?:gender|character_key)\s*:\s*["']/u
    );

    assert.doesNotMatch(
      source,
      /player_two[\s\S]{0,120}(?:gender|character_key)\s*:\s*["']/u
    );
  }
);

test(
  "3C contract owns no gameplay or motion authority",
  () => {
    const source =
      fs.readFileSync(
        new URL(
          "../domain/cingArtilleryCharacterPresentationV1.js",
          import.meta.url
        ),
        "utf8"
      );

    for (const forbidden of [
      "position_x",
      "position_y",
      "motion_state",
      "velocity",
      "damage",
      "shot",
      "terrain",
      "winner",
      "health",
    ]) {
      assert.equal(
        source.includes(forbidden),
        false,
        `forbidden authority token: ${forbidden}`
      );
    }
  }
);
