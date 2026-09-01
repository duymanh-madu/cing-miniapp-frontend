const CHARACTER_ARTWORK_PACKAGE_VERSION_V1 =
  "cing-artillery-character-artwork-package-v1";

const CHARACTER_ARTWORK_ROOT_V1 =
  "/game-assets/cing-piu-piu/characters/default/v1";

const CHARACTER_ARTWORK_GENDERS_V1 =
  Object.freeze([
    "male",
    "female",
  ]);

const CHARACTER_ARTWORK_STATES_V1 =
  Object.freeze([
    "idle",
    "aim",
    "shoot",
    "hit",
    "fall",
    "victory",
    "defeat",
  ]);

const CHARACTER_ARTWORK_CANVAS_V1 =
  Object.freeze({
    widthPx: 384,
    heightPx: 384,
  });

function makeStateManifest(
  gender,
  state
) {
  const root =
    `${CHARACTER_ARTWORK_ROOT_V1}/${gender}`;

  return Object.freeze({
    gender,
    state,

    image:
      `${root}/${state}.webp`,

    atlas:
      `${root}/${state}.json`,

    widthPx:
      CHARACTER_ARTWORK_CANVAS_V1.widthPx,

    heightPx:
      CHARACTER_ARTWORK_CANVAS_V1.heightPx,

    transparent:
      true,
  });
}

function makeGenderManifest(
  gender
) {
  return Object.freeze({
    gender,

    states:
      Object.freeze(
        Object.fromEntries(
          CHARACTER_ARTWORK_STATES_V1.map(
            (state) => [
              state,
              makeStateManifest(
                gender,
                state
              ),
            ]
          )
        )
      ),
  });
}

const CHARACTER_ARTWORK_MANIFEST_V1 =
  Object.freeze({
    male:
      makeGenderManifest(
        "male"
      ),

    female:
      makeGenderManifest(
        "female"
      ),
  });

const CANONICAL_WEAPON_ARTWORK_V1 =
  Object.freeze({
    key:
      "cing-standard-cannon-v1",

    root:
      `${CHARACTER_ARTWORK_ROOT_V1}/weapon`,

    shared:
      true,

    base:
      Object.freeze({
        image:
          `${CHARACTER_ARTWORK_ROOT_V1}/weapon/cing-standard-cannon-v1.webp`,

        meta:
          `${CHARACTER_ARTWORK_ROOT_V1}/weapon/cing-standard-cannon-v1.json`,
      }),

    cosmeticMask:
      Object.freeze({
        image:
          `${CHARACTER_ARTWORK_ROOT_V1}/weapon/cing-standard-cannon-v1-cosmetic-mask.webp`,

        meta:
          `${CHARACTER_ARTWORK_ROOT_V1}/weapon/cing-standard-cannon-v1-cosmetic-mask.json`,
      }),
  });

export {
  CANONICAL_WEAPON_ARTWORK_V1,
  CHARACTER_ARTWORK_CANVAS_V1,
  CHARACTER_ARTWORK_GENDERS_V1,
  CHARACTER_ARTWORK_MANIFEST_V1,
  CHARACTER_ARTWORK_PACKAGE_VERSION_V1,
  CHARACTER_ARTWORK_ROOT_V1,
  CHARACTER_ARTWORK_STATES_V1,
};
