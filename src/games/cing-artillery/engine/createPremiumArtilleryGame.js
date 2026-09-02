import {
  PREMIUM_ARTILLERY_RENDER,
} from "./premiumArtilleryConfig";

import createBattleScene, {
  CANONICAL_RESULT_EVENT,
} from "../scenes/BattleScene";

export async function
createPremiumArtilleryGame(
  parent,
  {
    snapshot,
    onFireIntent,
    onExitIntent,
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

  const BattleScene =
    createBattleScene(
      Phaser,
      {
        initialSnapshot:
          snapshot,

        onFireIntent,
        onExitIntent,
      }
    );

  return new Phaser.Game({
    type:
      Phaser.WEBGL,

    parent,

    width:
      PREMIUM_ARTILLERY_RENDER
        .width,

    height:
      PREMIUM_ARTILLERY_RENDER
        .height,

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

    scale: {
      mode:
        Phaser.Scale.FIT,

      autoCenter:
        Phaser.Scale.CENTER_BOTH,

      width:
        PREMIUM_ARTILLERY_RENDER
          .width,

      height:
        PREMIUM_ARTILLERY_RENDER
          .height,
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
