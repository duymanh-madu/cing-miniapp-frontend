const CHARACTER_VISUAL_ASSET_VERSION_V1 =
  "cing-artillery-character-visual-assets-v1";

const CHARACTER_ANIMATION_STATES_V1 =
  Object.freeze([
    "idle",
    "aim",
    "shoot",
    "hit",
    "fall",
    "victory",
    "defeat",
  ]);

const DEFAULT_CHARACTER_KEY_V1 =
  "default";

const CHARACTER_GENDERS_V1 =
  Object.freeze([
    "male",
    "female",
  ]);

const CHARACTER_ASSET_ROOT_V1 =
  "/game-assets/cing-piu-piu/characters/default/v1";

function makeStateAssets(
  gender
) {
  const root =
    `${CHARACTER_ASSET_ROOT_V1}/${gender}`;

  return Object.freeze(
    Object.fromEntries(
      CHARACTER_ANIMATION_STATES_V1.map(
        (state) => [
          state,
          Object.freeze({
            state,
            atlasImage:
              `${root}/${state}.webp`,
            atlasData:
              `${root}/${state}.json`,
          }),
        ]
      )
    )
  );
}

const CHARACTER_VISUAL_REGISTRY_V1 =
  Object.freeze({
    [DEFAULT_CHARACTER_KEY_V1]:
      Object.freeze({
        male:
          Object.freeze({
            characterKey:
              DEFAULT_CHARACTER_KEY_V1,
            gender:
              "male",
            states:
              makeStateAssets(
                "male"
              ),
          }),

        female:
          Object.freeze({
            characterKey:
              DEFAULT_CHARACTER_KEY_V1,
            gender:
              "female",
            states:
              makeStateAssets(
                "female"
              ),
          }),
      }),
  });

function fail(
  field
) {
  const error =
    new Error(
      `CHARACTER_VISUAL_ASSET_UNSUPPORTED_V1:${field}`
    );

  error.code =
    "CING_PIU_PIU_CHARACTER_VISUAL_ASSET_UNSUPPORTED";

  throw error;
}

function normalizeExactText(
  value,
  field
) {
  if (
    typeof value !==
      "string" ||
    value.length ===
      0 ||
    value.trim() !==
      value
  ) {
    fail(field);
  }

  return value;
}

function resolveCharacterVisualAssetV1({
  character_key,
  gender,
} = {}) {
  const characterKey =
    normalizeExactText(
      character_key,
      "character_key"
    );

  const canonicalGender =
    normalizeExactText(
      gender,
      "gender"
    );

  if (
    !CHARACTER_GENDERS_V1.includes(
      canonicalGender
    )
  ) {
    fail("gender");
  }

  const character =
    CHARACTER_VISUAL_REGISTRY_V1[
      characterKey
    ];

  if (!character) {
    fail("character_key");
  }

  const visual =
    character[
      canonicalGender
    ];

  if (!visual) {
    fail("gender");
  }

  return visual;
}

export {
  CHARACTER_ANIMATION_STATES_V1,
  CHARACTER_GENDERS_V1,
  CHARACTER_VISUAL_ASSET_VERSION_V1,
  DEFAULT_CHARACTER_KEY_V1,
  resolveCharacterVisualAssetV1,
};
