import {
  CHARACTER_STATE_V1,
} from "./cingArtilleryCharacterControllerV1.js";

import {
  resolveCharacterVisualAssetV1,
} from "../runtime/cingArtilleryCharacterVisualAssetsV1.js";

const CHARACTER_RENDERER_VERSION_V1 =
  "cing-artillery-character-renderer-v1";

const CHARACTER_RENDER_SCALE_V1 =
  0.24;

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

function assertSceneV1(
  scene
) {
  if (
    !scene ||
    !scene.add ||
    typeof scene.add.sprite !==
      "function"
  ) {
    throw new Error(
      "CHARACTER_RENDERER_SCENE_INVALID_V1"
    );
  }
}

function createCharacterRendererV1({
  scene,
  container,
  identity,
}) {
  assertSceneV1(
    scene
  );

  if (
    !container ||
    typeof container.add !==
      "function"
  ) {
    throw new Error(
      "CHARACTER_RENDERER_CONTAINER_INVALID_V1"
    );
  }

  if (
    !identity ||
    typeof identity !==
      "object"
  ) {
    throw new Error(
      "CHARACTER_RENDERER_IDENTITY_INVALID_V1"
    );
  }

  const assets =
    resolveCharacterVisualAssetV1({
      character_key:
        identity.character_key,

      gender:
        identity.gender,
    });

  let currentState =
    CHARACTER_STATE_V1.IDLE;

  const initialTextureKey =
    textureKeyFor({
      gender:
        identity.gender,

      state:
        currentState,
    });

  const sprite =
    scene.add
      .sprite(
        0,
        0,
        initialTextureKey
      )
      .setOrigin(
        0.5,
        0.88
      )
      .setScale(
        CHARACTER_RENDER_SCALE_V1
      );

  container.add(
    sprite
  );

  function setState(
    state
  ) {
    if (
      !Object.prototype.hasOwnProperty.call(
        assets.states,
        state
      )
    ) {
      throw new Error(
        `CHARACTER_RENDERER_STATE_UNAVAILABLE_V1:${String(
          state
        )}`
      );
    }

    currentState =
      state;

    const key =
      textureKeyFor({
        gender:
          identity.gender,

        state,
      });

    if (
      sprite.texture?.key !==
      key
    ) {
      sprite.setTexture(
        key
      );
    }

    if (
      scene.anims &&
      typeof scene.anims.exists ===
        "function" &&
      scene.anims.exists(
        key
      )
    ) {
      sprite.play(
        key,
        true
      );
    }

    return currentState;
  }

  function setActive(
    active
  ) {
    sprite.setAlpha(
      active === true
        ? 1
        : 0.78
    );

    return active ===
      true;
  }

  function destroy() {
    sprite.destroy();
  }

  return Object.freeze({
    version:
      CHARACTER_RENDERER_VERSION_V1,

    sprite,

    assets,

    setState,

    setActive,

    destroy,

    getState() {
      return currentState;
    },
  });
}

export {
  CHARACTER_RENDERER_VERSION_V1,
  CHARACTER_RENDER_SCALE_V1,
  createCharacterRendererV1,
  textureKeyFor,
};
