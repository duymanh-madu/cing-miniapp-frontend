import {
  CHARACTER_ARTWORK_GENDERS_V1,
  CHARACTER_ARTWORK_STATES_V1,
} from "../runtime/cingArtilleryCharacterArtworkManifestV1.js";

import {
  resolveCharacterVisualAssetV1,
} from "../runtime/cingArtilleryCharacterVisualAssetsV1.js";

const CHARACTER_PRELOAD_VERSION_V1 =
  "cing-artillery-character-preload-v1";

function textureKeyFor({
  gender,
  state,
}) {
  return [
    "cing-piu-piu-character",
    gender,
    state,
    "v1",
  ].join("-");
}

function preloadCharacterAssetsV1(
  scene
) {
  if (
    !scene?.load ||
    typeof scene.load.atlas !==
      "function"
  ) {
    throw new Error(
      "CHARACTER_PRELOAD_SCENE_INVALID_V1"
    );
  }

  const registrations =
    [];

  for (
    const gender
    of CHARACTER_ARTWORK_GENDERS_V1
  ) {
    const bundle =
      resolveCharacterVisualAssetV1({
        character_key:
          "default",

        gender,
      });

    for (
      const state
      of CHARACTER_ARTWORK_STATES_V1
    ) {
      const asset =
        bundle.states[
          state
        ];

      const key =
        textureKeyFor({
          gender,
          state,
        });

      scene.load.atlas(
        key,
        asset.image,
        asset.atlas
      );

      registrations.push(
        Object.freeze({
          key,
          gender,
          state,
          image:
            asset.image,
          atlas:
            asset.atlas,
        })
      );
    }
  }

  return Object.freeze(
    registrations
  );
}

export {
  CHARACTER_PRELOAD_VERSION_V1,
  preloadCharacterAssetsV1,
  textureKeyFor,
};
