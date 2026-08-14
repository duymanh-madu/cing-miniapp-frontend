import {
  PREMIUM_ARTILLERY_RENDER,
} from "./premiumArtilleryConfig";

import createEngineValidationScene
  from "../scenes/EngineValidationScene";

export async function createPremiumArtilleryGame(
  parent
) {
  if (!parent) {
    throw new Error(
      "Premium artillery mount target is required"
    );
  }

  const PhaserModule =
    await import("phaser");

  const Phaser =
    PhaserModule.default ||
    PhaserModule;

  const EngineValidationScene =
    createEngineValidationScene(
      Phaser
    );

  const game =
    new Phaser.Game({
      type:
        Phaser.WEBGL,

      parent,

      width:
        PREMIUM_ARTILLERY_RENDER.width,

      height:
        PREMIUM_ARTILLERY_RENDER.height,

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
          PREMIUM_ARTILLERY_RENDER.width,

        height:
          PREMIUM_ARTILLERY_RENDER.height,
      },

      scene: [
        EngineValidationScene,
      ],
    });

  return game;
}
