import {
  CHARACTER_ARTWORK_STATES_V1,
} from "../runtime/cingArtilleryCharacterArtworkSpecV1.js";

import {
  CHARACTER_GENDERS_V1,
} from "../runtime/cingArtilleryCharacterVisualAssetsV1.js";

import {
  textureKeyFor,
} from "./cingArtilleryCharacterPreloadV1.js";

const CHARACTER_ANIMATION_RUNTIME_VERSION_V1 =
  "cing-artillery-character-animation-runtime-v1";

function animationKeyFor({
  gender,
  state,
}) {
  return textureKeyFor({
    gender,
    state,
  });
}

function extractAtlasFrameNamesV1({
  scene,
  textureKey,
}) {
  if (
    !scene?.textures ||
    typeof scene.textures.get !==
      "function"
  ) {
    throw new Error(
      "CHARACTER_ANIMATION_TEXTURE_MANAGER_INVALID_V1"
    );
  }

  const texture =
    scene.textures.get(
      textureKey
    );

  if (
    !texture ||
    typeof texture.getFrameNames !==
      "function"
  ) {
    throw new Error(
      `CHARACTER_ANIMATION_TEXTURE_INVALID_V1:${textureKey}`
    );
  }

  const names =
    texture
      .getFrameNames()
      .filter(
        (name) =>
          typeof name ===
            "string" &&
          name.length > 0 &&
          name !== "__BASE"
      )
      .sort(
        (a, b) =>
          a.localeCompare(
            b,
            "en",
            {
              numeric: true,
            }
          )
      );

  if (
    names.length === 0
  ) {
    throw new Error(
      `CHARACTER_ANIMATION_FRAMES_MISSING_V1:${textureKey}`
    );
  }

  return Object.freeze(
    names
  );
}

function registerCharacterAnimationsV1(
  scene
) {
  if (
    !scene?.anims ||
    typeof scene.anims.create !==
      "function" ||
    typeof scene.anims.exists !==
      "function"
  ) {
    throw new Error(
      "CHARACTER_ANIMATION_MANAGER_INVALID_V1"
    );
  }

  const registrations = [];

  for (
    const gender
    of CHARACTER_GENDERS_V1
  ) {
    for (
      const [
        state,
        budget,
      ]
      of Object.entries(
        CHARACTER_ARTWORK_STATES_V1
      )
    ) {
      const key =
        animationKeyFor({
          gender,
          state,
        });

      if (
        scene.anims.exists(
          key
        )
      ) {
        registrations.push(
          Object.freeze({
            key,
            gender,
            state,
            existing:
              true,
          })
        );

        continue;
      }

      const frameNames =
        extractAtlasFrameNamesV1({
          scene,
          textureKey:
            key,
        });

      if (
        frameNames.length >
        budget.frameBudget
      ) {
        throw new Error(
          `CHARACTER_ANIMATION_FRAME_BUDGET_EXCEEDED_V1:${gender}:${state}:${frameNames.length}:${budget.frameBudget}`
        );
      }

      const frames =
        frameNames.map(
          (frame) => ({
            key,
            frame,
          })
        );

      scene.anims.create({
        key,
        frames,
        frameRate:
          budget.fps,
        repeat:
          budget.loop
            ? -1
            : 0,
      });

      registrations.push(
        Object.freeze({
          key,
          gender,
          state,
          fps:
            budget.fps,
          loop:
            budget.loop,
          frameCount:
            frameNames.length,
          existing:
            false,
        })
      );
    }
  }

  return Object.freeze(
    registrations
  );
}

export {
  CHARACTER_ANIMATION_RUNTIME_VERSION_V1,
  animationKeyFor,
  extractAtlasFrameNamesV1,
  registerCharacterAnimationsV1,
};
