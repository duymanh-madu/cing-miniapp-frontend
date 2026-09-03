import {
  PREMIUM_ARTILLERY_RENDER,
} from "./premiumArtilleryConfig";

import createBattleScene, {
  CANONICAL_RESULT_EVENT,
} from "../scenes/BattleScene";


function clampUnitInterval(
  value
) {
  return Math.max(
    0,
    Math.min(
      1,
      value
    )
  );
}


function installCingPiuPiuRotatedPointerAdapter(
  game,
  parent
) {
  const inputManager =
    game?.input;

  const originalTransformPointer =
    inputManager
      ?.transformPointer;

  if (
    typeof originalTransformPointer !==
      "function"
  ) {
    return;
  }

  inputManager.transformPointer =
    function transformCingPiuPiuPointer(
      pointer,
      pageX,
      pageY,
      wasTouch
    ) {
      const rotated =
        parent
          ?.closest?.(
            ".cing-piu-piu--rotated-landscape"
          );

      if (!rotated) {
        return originalTransformPointer.call(
          this,
          pointer,
          pageX,
          pageY,
          wasTouch
        );
      }

      const rect =
        game
          ?.canvas
          ?.getBoundingClientRect?.();

      if (
        !rect ||
        !(rect.width > 0) ||
        !(rect.height > 0)
      ) {
        return originalTransformPointer.call(
          this,
          pointer,
          pageX,
          pageY,
          wasTouch
        );
      }

      const scrollX =
        window.scrollX ||
        window.pageXOffset ||
        0;

      const scrollY =
        window.scrollY ||
        window.pageYOffset ||
        0;

      const physicalX =
        clampUnitInterval(
          (
            pageX -
            rect.left -
            scrollX
          ) /
          rect.width
        );

      const physicalY =
        clampUnitInterval(
          (
            pageY -
            rect.top -
            scrollY
          ) /
          rect.height
        );

      /*
       * Presentation rotates clockwise 90 degrees.
       *
       * Inverse normalized mapping:
       *
       * canonical X = physical Y
       * canonical Y = 1 - physical X
       *
       * Gameplay authority itself remains unchanged.
       */
      const canonicalX =
        physicalY;

      const canonicalY =
        1 -
        physicalX;

      const mappedPageX =
        rect.left +
        scrollX +
        (
          canonicalX *
          rect.width
        );

      const mappedPageY =
        rect.top +
        scrollY +
        (
          canonicalY *
          rect.height
        );

      return originalTransformPointer.call(
        this,
        pointer,
        mappedPageX,
        mappedPageY,
        wasTouch
      );
    };
}

function getCingPiuPiuInitialRenderSize(
  parent
) {
  const width =
    Math.max(
      1,
      Math.round(
        parent?.clientWidth ||
        PREMIUM_ARTILLERY_RENDER.width
      )
    );

  const height =
    Math.max(
      1,
      Math.round(
        parent?.clientHeight ||
        PREMIUM_ARTILLERY_RENDER.height
      )
    );

  return {
    width,
    height,
  };
}


export async function
createPremiumArtilleryGame(
  parent,
  {
    snapshot,
    onFireIntent,
    onExitIntent,
    onRematchIntent,
  } = {}
) {
  if (!parent) {
    throw new Error(
      "Premium artillery mount target is required"
    );
  }

  if (!snapshot) {
    throw new Error(
      "Authoritative battle snapshot is required"
    );
  }

  const PhaserModule =
    await import(
      "phaser"
    );

  const Phaser =
    PhaserModule.default ||
    PhaserModule;

  const initialRenderSize =
    getCingPiuPiuInitialRenderSize(
      parent
    );

  const BattleScene =
    createBattleScene(
      Phaser,
      {
        initialSnapshot:
          snapshot,

        onFireIntent,
        onExitIntent,
        onRematchIntent,
      }
    );

  return new Phaser.Game({
    type:
      Phaser.WEBGL,

    parent,

    width:
      initialRenderSize.width,

    height:
      initialRenderSize.height,

    backgroundColor:
      PREMIUM_ARTILLERY_RENDER
        .backgroundColor,

    transparent:
      false,

    antialias:
      true,

    roundPixels:
      false,

    pixelArt:
      false,

    render: {
      antialias:
        true,

      antialiasGL:
        true,

      powerPreference:
        "high-performance",
    },

    callbacks: {
      postBoot:
        game => {
          installCingPiuPiuRotatedPointerAdapter(
            game,
            parent
          );
        },
    },

    scale: {
      /*
       * Render buffer follows the real logical battle viewport.
       * Canonical gameplay geometry stays inside BattleScene.
       */
      mode:
        Phaser.Scale.RESIZE,

      width:
        initialRenderSize.width,

      height:
        initialRenderSize.height,
    },

    scene: [
      BattleScene,
    ],
  });
}


export function
presentCanonicalArtilleryResult(
  game,
  result
) {
  if (
    !game?.events ||
    !result
  ) {
    return Promise.reject(
      new Error(
        "Canonical artillery presentation bridge không hợp lệ"
      )
    );
  }

  return new Promise(
    (
      resolve,
      reject
    ) => {
      game.events.emit(
        CANONICAL_RESULT_EVENT,
        {
          result,
          resolve,
          reject,
        }
      );
    }
  );
}
