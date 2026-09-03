import {
  resolveCingArtilleryMapAsset,
} from "../runtime/cingArtilleryMapAssets";

import {
  MOTION_STATE,
  projectPlayerMotionV1,
} from "../domain/cingArtilleryPlayerMotionProjectionV1";

import {
  projectCharacterPresentationV1,
} from "../domain/cingArtilleryCharacterPresentationV1";

import {
  TERMINAL_COMPLETION_REASON_V1,
  projectTerminalPresentationV1,
} from "../domain/cingArtilleryTerminalPresentationV1.js";

import {
  CHARACTER_STATE_V1,
  createCharacterPresentationControllerV1,
} from "../presentation/cingArtilleryCharacterControllerV1";

import {
  createCharacterRendererV1,
  textureKeyFor as characterTextureKeyForV1,
} from "../presentation/cingArtilleryCharacterRendererV1";

import {
  preloadCharacterAssetsV1,
} from "../presentation/cingArtilleryCharacterPreloadV1";

import {
  registerCharacterAnimationsV1,
} from "../presentation/cingArtilleryCharacterAnimationsV1";

import {
  createFiringPresentationV1,
} from "../presentation/cingArtilleryFiringPresentationV1";


import {
  projectMutableTerrainV1,
} from "../domain/cingArtilleryMutableTerrainProjectionV1";

import {
  rasterizeMutableTerrainV1,
} from "../presentation/cingArtilleryTerrainRasterV1";


const SNAPSHOT_EVENT =
  "cing-artillery:battle-snapshot";

const CANONICAL_RESULT_EVENT =
  "cing-artillery:canonical-shot-result";

const AIM_ANGLE_MIN_DEG =
  10;

const AIM_ANGLE_MAX_DEG =
  80;

const AIM_ANGLE_STEP_DEG =
  2;

const POWER_MIN =
  0;

const POWER_MAX =
  100;

const POWER_STEP =
  5;

const DEFAULT_AIM_ANGLE_DEG =
  45;

const DEFAULT_POWER =
  60;

const COMMERCIAL_HUD_V1 =
  Object.freeze({
    topBarHeight: 106,
    playerPanelWidth: 236,
    playerPanelHeight: 58,
    centerPanelWidth: 142,
    centerPanelHeight: 62,
    controlPanelY: 490,
    controlPanelHeight: 82,
    hpBarWidth: 146,
    hpBarHeight: 10,
    powerBarWidth: 148,
    powerBarHeight: 12,
  });

const HUD_DEPTH_V1 =
  900;

const CONTROL_DEPTH_V1 =
  910;

function displayHp(
  value
) {
  const numeric =
    Number(
      value
    );

  if (
    !Number.isFinite(
      numeric
    ) ||
    numeric < 0
  ) {
    return "—";
  }

  return String(
    Math.floor(
      numeric
    )
  );
}

function displayWind(
  value
) {
  const numeric =
    Number(
      value
    );

  if (
    !Number.isFinite(
      numeric
    )
  ) {
    return {
      arrow:
        "•",

      text:
        "0",
    };
  }

  return {
    arrow:
      numeric > 0
        ? "→"
        : numeric < 0
          ? "←"
          : "•",

    text:
      Math.abs(
        numeric
      ).toFixed(1),
  };
}

function remainingSeconds(
  deadline
) {
  const timestamp =
    Date.parse(
      String(
        deadline || ""
      )
    );

  if (
    !Number.isFinite(
      timestamp
    )
  ) {
    return null;
  }

  return Math.max(
    0,
    Math.ceil(
      (
        timestamp -
        Date.now()
      ) /
      1000
    )
  );
}

export default function
createBattleScene(
  Phaser,
  {
    initialSnapshot,
    onFireIntent,
    onExitIntent,
    onRematchIntent,
  }
) {
  const mapAsset =
    resolveCingArtilleryMapAsset(
      initialSnapshot
        ?.world
        ?.map_id
    );

  return class BattleScene
    extends Phaser.Scene {
    constructor() {
      super({
        key:
          "CingPiuPiuBattleScene",
      });

      this.snapshot =
        initialSnapshot;

      this.playerOneMarker =
        null;

      this.playerTwoMarker =
        null;

      this.playerOneMotionTween =
        null;

      this.playerTwoMotionTween =
        null;

      this.playerOneMotionInitialized =
        false;

      this.playerTwoMotionInitialized =
        false;

      this.playerOneHp =
        null;

      this.playerTwoHp =
        null;

      this.turnText =
        null;

      this.timerText =
        null;

      this.windText =
        null;

      this.viewerText =
        null;

      this.lastTimerValue =
        null;

      this.aimAngleDeg =
        DEFAULT_AIM_ANGLE_DEG;

      this.shotPower =
        DEFAULT_POWER;

      this.firePendingTurn =
        null;

      this.angleText =
        null;

      this.powerText =
        null;

      this.fireButton =
        null;

      this.controlButtons =
        [];

      this.fireStatusText =
        null;

      this.commercialHud =
        null;

      this.playerOneHpFill =
        null;

      this.playerTwoHpFill =
        null;

      this.powerBarFill =
        null;

      this.aimGuide =
        null;

      this.aimGuideTip =
        null;

      this.firingPresentation =
        null;

      this.terrainTexture =
        null;

      this.terrainImage =
        null;

      this.lastTerrainRevision =
        null;

      this.terrainTextureKey =
        `cing-piu-piu-terrain-${mapAsset.mapKey}-v${mapAsset.version}`;

    }

    preload() {
      this.load.svg(
        "cing-piu-piu-map-background",
        mapAsset.backgroundRenderAsset,
        {
          width:
            mapAsset.width,

          height:
            mapAsset.height,
        }
      );

      preloadCharacterAssetsV1(
        this
      );

    }

    create() {

      registerCharacterAnimationsV1(
        this
      );

      const scaleX =
        this.scale.width /
        mapAsset.width;

      const scaleY =
        this.scale.height /
        mapAsset.height;

      if (
        Math.abs(
          scaleX -
          scaleY
        ) >
        0.000001
      ) {
        throw new Error(
          "Cing Piu Piu render surface không đồng tỷ lệ với combat world"
        );
      }

      const world =
        this.add.container(
          0,
          0
        );

      this.world =
        world;

      world.setScale(
        scaleX
      );

      world.add(
        this.add
          .image(
            mapAsset.width / 2,
            mapAsset.height / 2,
            "cing-piu-piu-map-background"
          )
          .setDisplaySize(
            mapAsset.width,
            mapAsset.height
          )
      );

      this.createAuthoritativeTerrainSurface(
        world
      );


      world.add(
        this.add.rectangle(
          mapAsset.width / 2,
          52,
          mapAsset.width,
          104,
          0x07111f,
          0.52
        )
      );

      world.add(
        this.add.rectangle(
          mapAsset.width / 2,
          mapAsset.height - 34,
          mapAsset.width,
          68,
          0x07111f,
          0.34
        )
      );

      this.playerOneMarker =
        this.createPlayerMarker({
          world,
          label:
            "P1",
          accent:
            0xffa33c,
        });

      this.playerOneCharacterController =
        createCharacterPresentationControllerV1({
          container:
            this.playerOneMarker.container,

          activeIndicator:
            this.playerOneMarker.outer,
        });

      this.playerTwoMarker =
        this.createPlayerMarker({
          world,
          label:
            "P2",
          accent:
            0x64c7ff,
        });

      this.playerTwoCharacterController =
        createCharacterPresentationControllerV1({
          container:
            this.playerTwoMarker.container,

          activeIndicator:
            this.playerTwoMarker.outer,
        });

      this.playerOneHp =
        this.add
          .text(
            24,
            20,
            "",
            {
              fontFamily:
                "Inter, Arial, sans-serif",

              fontSize:
                "18px",

              fontStyle:
                "bold",

              color:
                "#ffffff",
            }
          )
          .setOrigin(
            0,
            0
          );

      world.add(
        this.playerOneHp
      );

      this.playerTwoHp =
        this.add
          .text(
            mapAsset.width - 24,
            20,
            "",
            {
              fontFamily:
                "Inter, Arial, sans-serif",

              fontSize:
                "18px",

              fontStyle:
                "bold",

              color:
                "#ffffff",

              align:
                "right",
            }
          )
          .setOrigin(
            1,
            0
          );

      world.add(
        this.playerTwoHp
      );

      this.turnText =
        this.add
          .text(
            mapAsset.width / 2,
            16,
            "",
            {
              fontFamily:
                "Inter, Arial, sans-serif",

              fontSize:
                "16px",

              fontStyle:
                "bold",

              color:
                "#ffe2a8",

              stroke:
                "#07111f",

              strokeThickness:
                5,
            }
          )
          .setOrigin(
            0.5,
            0
          );

      world.add(
        this.turnText
      );

      this.timerText =
        this.add
          .text(
            mapAsset.width / 2,
            42,
            "",
            {
              fontFamily:
                "Inter, Arial, sans-serif",

              fontSize:
                "25px",

              fontStyle:
                "bold",

              color:
                "#ffffff",

              stroke:
                "#07111f",

              strokeThickness:
                6,
            }
          )
          .setOrigin(
            0.5,
            0
          );

      world.add(
        this.timerText
      );

      this.windText =
        this.add
          .text(
            mapAsset.width / 2,
            mapAsset.height - 48,
            "",
            {
              fontFamily:
                "Inter, Arial, sans-serif",

              fontSize:
                "16px",

              fontStyle:
                "bold",

              color:
                "#ffffff",

              stroke:
                "#07111f",

              strokeThickness:
                5,
            }
          )
          .setOrigin(
            0.5
          );

      world.add(
        this.windText
      );

      this.viewerText =
        this.add
          .text(
            mapAsset.width / 2,
            mapAsset.height - 20,
            "",
            {
              fontFamily:
                "Inter, Arial, sans-serif",

              fontSize:
                "11px",

              color:
                "#d7e5ef",

              stroke:
                "#07111f",

              strokeThickness:
                4,
            }
          )
          .setOrigin(
            0.5
          );

      world.add(
        this.viewerText
      );

      this.createBattleControls(
        world
      );

      this.createCommercialBattleHudV1(
        world
      );

      /*
       * Commercial HUD supersedes the original diagnostic
       * battle text. Keep the objects alive for existing
       * snapshot projection, but never render both layers.
       */
      [
        this.playerOneHp,
        this.playerTwoHp,
        this.turnText,
        this.timerText,
        this.windText,
        this.viewerText,
      ].forEach(
        item =>
          item?.setVisible(
            false
          )
      );

      this.firingPresentation =
        createFiringPresentationV1({
          scene:
            this,

          world,

          snapshot:
            this.snapshot,

          getAimAngleDeg:
            () =>
              this.aimAngleDeg,

          getPower:
            () =>
              this.shotPower,

          setPower:
            value =>
              this.setPower(
                value
              ),

          isViewerTurn:
            () =>
              this.isViewerTurn(),

          getCharacterController:
            () => {
              const viewer =
                this.snapshot
                  ?.viewer
                  ?.account_id;

              if (
                this.snapshot
                  ?.players
                  ?.player_one
                  ?.account_id ===
                viewer
              ) {
                return this
                  .playerOneCharacterController;
              }

              if (
                this.snapshot
                  ?.players
                  ?.player_two
                  ?.account_id ===
                viewer
              ) {
                return this
                  .playerTwoCharacterController;
              }

              return null;
            },
        });

      this.bindCommercialFireButtonV1();

      this.game.events.on(
        SNAPSHOT_EVENT,
        this.handleSnapshot,
        this
      );

      this.game.events.on(
        CANONICAL_RESULT_EVENT,
        this.handleCanonicalResult,
        this
      );

      this.events.once(
        Phaser.Scenes.Events.SHUTDOWN,
        () => {
          this.game.events.off(
            SNAPSHOT_EVENT,
            this.handleSnapshot,
            this
          );

          this.game.events.off(
            CANONICAL_RESULT_EVENT,
            this.handleCanonicalResult,
            this
          );

                      this.playerOneMotionTween
              ?.stop();

            this.playerOneMotionTween =
              null;

            this.playerTwoMotionTween
              ?.stop();

            this.playerTwoMotionTween =
              null;

this.presentationTween
            ?.stop();

          this.presentationTween =
            null;

          this.presentationProjectile
            ?.destroy();

          this.presentationProjectile =
            null;

          this.presentationCameraTarget
            ?.destroy();

          this.presentationCameraTarget =
            null;

          this.presentationTrail
            ?.destroy();

          this.presentationTrail =
            null;

            this.terrainImage
              ?.destroy();

            this.terrainImage =
              null;

            this.terrainTexture =
              null;

            this.lastTerrainRevision =
              null;

            if (
              this.textures.exists(
                this.terrainTextureKey
              )
            ) {
              this.textures.remove(
                this.terrainTextureKey
              );
            }


          this.cameras.main
            ?.stopFollow();

          this.cameras.main
            ?.setZoom(
              1
            );

          this.cameras.main
            ?.setScroll(
              0,
              0
            );

          this.firingPresentation
            ?.destroy?.();

          this.firingPresentation =
            null;
        }
      );

      this.applySnapshot(
        this.snapshot
      );
    }

    createAuthoritativeTerrainSurface(
      world
    ) {
      if (
        this.textures.exists(
          this.terrainTextureKey
        )
      ) {
        this.textures.remove(
          this.terrainTextureKey
        );
      }

      const texture =
        this.textures.createCanvas(
          this.terrainTextureKey,
          mapAsset.width,
          mapAsset.height
        );

      if (!texture) {
        throw new Error(
          "Mutable terrain texture Cing Piu Piu không thể khởi tạo"
        );
      }

      this.terrainTexture =
        texture;

      this.terrainImage =
        this.add
          .image(
            mapAsset.width / 2,
            mapAsset.height / 2,
            this.terrainTextureKey
          )
          .setDisplaySize(
            mapAsset.width,
            mapAsset.height
          );

      world.add(
        this.terrainImage
      );
    }

    applyAuthoritativeTerrain(
      terrainInput
    ) {
      if (
        !terrainInput ||
        terrainInput
          .collision_format !==
          "bitmask_v1"
      ) {
        throw new Error(
          "Mutable terrain format Cing Piu Piu không hợp lệ"
        );
      }

      const terrain =
        projectMutableTerrainV1(
          terrainInput
        );

      if (
        terrain.map_id !==
          mapAsset.mapId ||
        terrain.width_px !==
          mapAsset.width ||
        terrain.height_px !==
          mapAsset.height
      ) {
        throw new Error(
          "Mutable terrain Cing Piu Piu không khớp render map"
        );
      }

      if (
        terrain.terrain_revision ===
        this.lastTerrainRevision
      ) {
        return;
      }

      if (
        !this.terrainTexture
      ) {
        throw new Error(
          "Mutable terrain texture Cing Piu Piu chưa sẵn sàng"
        );
      }

      const pixels =
        rasterizeMutableTerrainV1(
          terrain
        );

      const context =
        this.terrainTexture
          .getContext();

      if (!context) {
        throw new Error(
          "Mutable terrain canvas Cing Piu Piu chưa sẵn sàng"
        );
      }

      const imageData =
        context.createImageData(
          terrain.width_px,
          terrain.height_px
        );

      imageData.data.set(
        pixels
      );

      context.clearRect(
        0,
        0,
        terrain.width_px,
        terrain.height_px
      );

      context.putImageData(
        imageData,
        0,
        0
      );

      this.terrainTexture
        .refresh();

      this.lastTerrainRevision =
        terrain.terrain_revision;
    }

    applyAuthoritativePlayerMotion({
      marker,
      player,
      slot,
    }) {
      if (
        !marker?.container ||
        (
          slot !==
            "player_one" &&
          slot !==
            "player_two"
        )
      ) {
        throw new Error(
          "Player motion presentation Cing Piu Piu không hợp lệ"
        );
      }

      const projected =
        projectPlayerMotionV1(
          player
        );

      const tweenKey =
        slot ===
          "player_one"
          ? "playerOneMotionTween"
          : "playerTwoMotionTween";

      const initializedKey =
        slot ===
          "player_one"
          ? "playerOneMotionInitialized"
          : "playerTwoMotionInitialized";

      const existingTween =
        this[
          tweenKey
        ];

      if (existingTween) {
        existingTween.stop();

        this[
          tweenKey
        ] =
          null;
      }

      if (
        this[
          initializedKey
        ] !==
          true ||
        projected.motion_state ===
          MOTION_STATE.STABLE
      ) {
        marker
          .container
          .setPosition(
            projected.position_x,
            projected.position_y
          );

        marker
          .container
          .setAngle(
            0
          );

        marker
          .container
          .setAlpha(
            1
          );

        this[
          initializedKey
        ] =
          true;

        return projected;
      }

      /*
       * Presentation only.
       *
       * The server owns the motion state and destination.
       * Phaser only interpolates the currently displayed marker
       * to the supplied authoritative coordinates.
       */
      const deltaX =
        projected.position_x -
        marker.container.x;

      const deltaY =
        projected.position_y -
        marker.container.y;

      const visualDistance =
        Math.hypot(
          deltaX,
          deltaY
        );

      const durationMs =
        Math.max(
          90,
          Math.min(
            360,
            Math.round(
              visualDistance *
              2.4
            )
          )
        );

      this[
        tweenKey
      ] =
        this.tweens.add({
          targets:
            marker.container,

          x:
            projected.position_x,

          y:
            projected.position_y,

          angle:
            deltaX >= 0
              ? 18
              : -18,

          alpha:
            projected.position_y >
              mapAsset.height
              ? 0.30
              : 1,

          duration:
            durationMs,

          ease:
            "Quad.easeIn",

          onComplete:
            () => {
              marker
                .container
                .setPosition(
                  projected.position_x,
                  projected.position_y
                );

              if (
                projected.position_y <=
                  mapAsset.height
              ) {
                marker
                  .container
                  .setAlpha(
                    1
                  );
              }

              this[
                tweenKey
              ] =
                null;
            },
        });

      this[
        initializedKey
      ] =
        true;

      return projected;
    }

    createPlayerMarker({
      world,
      label,
      accent,
    }) {
      const container =
        this.add.container(
          0,
          0
        );

      const shadow =
        this.add.ellipse(
          0,
          0,
          44,
          12,
          0x000000,
          0.30
        );

      const outer =
        this.add.circle(
          0,
          -24,
          19,
          0x07111f,
          0.92
        );

      outer.setStrokeStyle(
        4,
        accent,
        1
      );

      const inner =
        this.add.circle(
          0,
          -24,
          11,
          accent,
          0.96
        );

      const text =
        this.add
          .text(
            0,
            -24,
            label,
            {
              fontFamily:
                "Inter, Arial, sans-serif",

              fontSize:
                "10px",

              fontStyle:
                "bold",

              color:
                "#07111f",
            }
          )
          .setOrigin(
            0.5
          );

      container.add([
        shadow,
        outer,
        inner,
        text,
      ]);

      world.add(
        container
      );

      return {
        container,
        outer,
      };
    }

    createControlButton({
      world,
      x,
      y,
      width,
      label,
      onPress,
      accent =
        0xffa33c,
    }) {
      const container =
        this.add.container(
          x,
          y
        );

      const background =
        this.add
          .rectangle(
            0,
            0,
            width,
            34,
            0x07111f,
            0.90
          )
          .setStrokeStyle(
            2,
            accent,
            0.90
          )
          .setInteractive({
            useHandCursor:
              true,
          });

      const text =
        this.add
          .text(
            0,
            0,
            label,
            {
              fontFamily:
                "Inter, Arial, sans-serif",

              fontSize:
                "14px",

              fontStyle:
                "bold",

              color:
                "#ffffff",
            }
          )
          .setOrigin(
            0.5
          );

      background.on(
        "pointerdown",
        () => {
          if (
            background.input
              ?.enabled !==
            true
          ) {
            return;
          }

          onPress();
        }
      );

      container.add([
        background,
        text,
      ]);

      world.add(
        container
      );

      this.controlButtons.push(
        background
      );

      return {
        container,
        background,
        text,
      };
    }

    createBattleControls(
      world
    ) {
      /*
       * Fullscreen V2 battle-control layout.
       *
       * Canonical gameplay remains 960x540.
       * This method owns presentation placement only:
       *
       * LEFT   : aim angle
       * CENTER : shot power
       * RIGHT  : fire
       */
      const y =
        mapAsset.height -
        76;

      const angleCenterX =
        136;

      const powerCenterX =
        mapAsset.width /
        2;

      const fireCenterX =
        mapAsset.width -
        104;

      const powerControlOffset =
        146;

      this.createControlButton({
        world,
        x:
          angleCenterX -
          62,
        y,
        width:
          46,
        label:
          "−",
        onPress:
          () => {
            this.setAimAngle(
              this.aimAngleDeg -
                AIM_ANGLE_STEP_DEG
            );
          },
      });

      this.angleText =
        this.add
          .text(
            angleCenterX,
            y,
            "",
            {
              fontFamily:
                "Inter, Arial, sans-serif",
              fontSize:
                "15px",
              fontStyle:
                "bold",
              color:
                "#ffffff",
              stroke:
                "#07111f",
              strokeThickness:
                4,
            }
          )
          .setOrigin(
            0.5
          );

      world.add(
        this.angleText
      );

      this.createControlButton({
        world,
        x:
          angleCenterX +
          62,
        y,
        width:
          46,
        label:
          "+",
        onPress:
          () => {
            this.setAimAngle(
              this.aimAngleDeg +
                AIM_ANGLE_STEP_DEG
            );
          },
      });

      this.createControlButton({
        world,
        x:
          powerCenterX -
          powerControlOffset,
        y,
        width:
          46,
        label:
          "−",
        onPress:
          () => {
            this.setPower(
              this.shotPower -
                POWER_STEP
            );
          },
        accent:
          0x64c7ff,
      });

      /*
       * Commercial power HUD owns the visible value/bar.
       * Keep no duplicate legacy power readout.
       */
      this.powerText =
        null;

      this.createControlButton({
        world,
        x:
          powerCenterX +
          powerControlOffset,
        y,
        width:
          46,
        label:
          "+",
        onPress:
          () => {
            this.setPower(
              this.shotPower +
                POWER_STEP
            );
          },
        accent:
          0x64c7ff,
      });

      this.fireButton =
        this.createControlButton({
          world,
          x:
            fireCenterX,
          y,
          width:
            132,
          label:
            "BẮN",
          accent:
            0xffb347,
          onPress:
            () => {
              void this.fireShot();
            },
        });

      this.fireStatusText =
        this.add
          .text(
            fireCenterX,
            y + 31,
            "",
            {
              fontFamily:
                "Inter, Arial, sans-serif",
              fontSize:
                "11px",
              fontStyle:
                "bold",
              color:
                "#ffd7a3",
              stroke:
                "#07111f",
              strokeThickness:
                3,
            }
          )
          .setOrigin(
            0.5
          );

      world.add(
        this.fireStatusText
      );

      this.refreshBattleControls();
      this.refreshCommercialBattleHudV1();

    }

    bindCommercialFireButtonV1() {
      const background =
        this.fireButton
          ?.background;

      if (!background) {
        throw new Error(
          "Cing Piu Piu commercial fire control chưa sẵn sàng"
        );
      }

      /*
       * Legacy button dispatches immediately on pointerdown.
       * Commercial input instead charges while held and
       * submits the bounded fire intent only on release.
       */
      background.removeAllListeners(
        "pointerdown"
      );

      background.on(
        "pointerdown",
        () => {
          if (
            background.input
              ?.enabled !==
              true
          ) {
            return;
          }

          const started =
            this.firingPresentation
              ?.beginCharge?.();

          if (!started) {
            return;
          }

          this.fireButton
            ?.text
            ?.setText(
              "GIỮ..."
            );

          this.fireStatusText
            ?.setText(
              "ĐANG NẠP LỰC"
            );
        }
      );

      const release =
        () => {
          if (
            !this.firingPresentation
              ?.releaseCharge?.()
          ) {
            return;
          }

          void this.fireShot();
        };

      background.on(
        "pointerup",
        release
      );

      background.on(
        "pointerout",
        () => {
          if (
            !this.firingPresentation
              ?.isCharging?.()
          ) {
            return;
          }

          this.firingPresentation
            .cancelCharge();

          this.fireStatusText
            ?.setText(
              ""
            );

          this.refreshBattleControls();
        }
      );
    }

    setAimAngle(
      value
    ) {
      this.aimAngleDeg =
        Math.max(
          AIM_ANGLE_MIN_DEG,
          Math.min(
            AIM_ANGLE_MAX_DEG,
            Number(
              value
            )
          )
        );

      this.refreshBattleControls();
      this.refreshCommercialBattleHudV1();
      this.refreshCommercialAimPresentationV1();

    }

    setPower(
      value
    ) {
      this.shotPower =
        Math.max(
          POWER_MIN,
          Math.min(
            POWER_MAX,
            Number(
              value
            )
          )
        );

      this.refreshBattleControls();
      this.refreshCommercialBattleHudV1();
    }

    createCommercialBattleHudV1(
      world
    ) {
      const hud =
        this.add.container(
          0,
          0
        )
          .setDepth(
            HUD_DEPTH_V1
          );

      const topShade =
        this.add.rectangle(
          mapAsset.width / 2,
          COMMERCIAL_HUD_V1.topBarHeight / 2,
          mapAsset.width,
          COMMERCIAL_HUD_V1.topBarHeight,
          0x07111f,
          0.72
        );

      const topLine =
        this.add.rectangle(
          mapAsset.width / 2,
          COMMERCIAL_HUD_V1.topBarHeight,
          mapAsset.width,
          1,
          0xffb454,
          0.28
        );

      const createPlayerPanel =
        ({
          x,
          accent,
          align,
          title,
        }) => {
          const panel =
            this.add.container(
              x,
              34
            );

          const background =
            this.add.rectangle(
              0,
              0,
              COMMERCIAL_HUD_V1.playerPanelWidth,
              COMMERCIAL_HUD_V1.playerPanelHeight,
              0x07111f,
              0.88
            )
              .setOrigin(
                align === "left"
                  ? 0
                  : 1,
                0
              )
              .setStrokeStyle(
                1,
                accent,
                0.48
              );

          const innerX =
            align === "left"
              ? 16
              : -16;

          const textOrigin =
            align === "left"
              ? 0
              : 1;

          const name =
            this.add.text(
              innerX,
              10,
              title,
              {
                fontFamily:
                  "Inter, Arial, sans-serif",
                fontSize:
                  "12px",
                fontStyle:
                  "bold",
                color:
                  "#ffffff",
              }
            )
              .setOrigin(
                textOrigin,
                0
              );

          const hpTrackX =
            align === "left"
              ? 16
              : -16 -
                COMMERCIAL_HUD_V1.hpBarWidth;

          const hpTrack =
            this.add.rectangle(
              hpTrackX,
              39,
              COMMERCIAL_HUD_V1.hpBarWidth,
              COMMERCIAL_HUD_V1.hpBarHeight,
              0x02060c,
              0.86
            )
              .setOrigin(
                0,
                0
              )
              .setStrokeStyle(
                1,
                0xffffff,
                0.12
              );

          const hpFill =
            this.add.rectangle(
              hpTrackX + 1,
              40,
              COMMERCIAL_HUD_V1.hpBarWidth - 2,
              COMMERCIAL_HUD_V1.hpBarHeight - 2,
              accent,
              0.96
            )
              .setOrigin(
                0,
                0
              );

          const hp =
            this.add.text(
              innerX,
              51,
              "",
              {
                fontFamily:
                  "Inter, Arial, sans-serif",
                fontSize:
                  "9px",
                fontStyle:
                  "bold",
                color:
                  "#dce8ef",
              }
            )
              .setOrigin(
                textOrigin,
                0
              );

          panel.add([
            background,
            name,
            hpTrack,
            hpFill,
            hp,
          ]);

          return {
            panel,
            name,
            hp,
            hpFill,
          };
        };

      const left =
        createPlayerPanel({
          x: 72,
          accent: 0xffa33c,
          align: "left",
          title: "CHIẾN BINH 1",
        });

      const right =
        createPlayerPanel({
          x: mapAsset.width - 24,
          accent: 0x64c7ff,
          align: "right",
          title: "CHIẾN BINH 2",
        });

      const center =
        this.add.container(
          mapAsset.width / 2,
          34
        );

      const centerBackground =
        this.add.rectangle(
          0,
          0,
          COMMERCIAL_HUD_V1.centerPanelWidth,
          COMMERCIAL_HUD_V1.centerPanelHeight,
          0x07111f,
          0.92
        )
          .setOrigin(
            0.5,
            0
          )
          .setStrokeStyle(
            1,
            0xffc267,
            0.52
          );

      const turnLabel =
        this.add.text(
          0,
          8,
          "TURN",
          {
            fontFamily:
              "Inter, Arial, sans-serif",
            fontSize:
              "10px",
            fontStyle:
              "bold",
            color:
              "#ffc267",
          }
        )
          .setOrigin(
            0.5,
            0
          );

      const timer =
        this.add.text(
          0,
          22,
          "",
          {
            fontFamily:
              "Inter, Arial, sans-serif",
            fontSize:
              "26px",
            fontStyle:
              "bold",
            color:
              "#ffffff",
          }
        )
          .setOrigin(
            0.5,
            0
          );

      const turnState =
        this.add.text(
          0,
          52,
          "",
          {
            fontFamily:
              "Inter, Arial, sans-serif",
            fontSize:
              "9px",
            fontStyle:
              "bold",
            color:
              "#d7e5ef",
          }
        )
          .setOrigin(
            0.5,
            0
          );

      center.add([
        centerBackground,
        turnLabel,
        timer,
        turnState,
      ]);

      const wind =
        this.add.text(
          mapAsset.width / 2,
          103,
          "",
          {
            fontFamily:
              "Inter, Arial, sans-serif",
            fontSize:
              "11px",
            fontStyle:
              "bold",
            color:
              "#eef7ff",
            backgroundColor:
              "#07111fcc",
            padding: {
              x: 10,
              y: 5,
            },
          }
        )
          .setOrigin(
            0.5,
            0
          );

      hud.add([
        topShade,
        topLine,
        left.panel,
        right.panel,
        center,
        wind,
      ]);

      world.add(
        hud
      );

      this.commercialHud = {
        container:
          hud,
        playerOneName:
          left.name,
        playerOneHp:
          left.hp,
        playerTwoName:
          right.name,
        playerTwoHp:
          right.hp,
        timer,
        turnState,
        wind,
      };

      this.playerOneHpFill =
        left.hpFill;

      this.playerTwoHpFill =
        right.hpFill;

      this.createCommercialAimPresentationV1(
        world
      );

      this.createCommercialPowerPresentationV1(
        world
      );

      this.refreshCommercialBattleHudV1();
    }

    createCommercialAimPresentationV1(
      world
    ) {
      const guide =
        this.add.graphics()
          .setDepth(
            CONTROL_DEPTH_V1
          );

      const tip =
        this.add.circle(
          0,
          0,
          4,
          0xffc267,
          0.98
        )
          .setDepth(
            CONTROL_DEPTH_V1 + 1
          );

      world.add(
        guide
      );

      world.add(
        tip
      );

      this.aimGuide =
        guide;

      this.aimGuideTip =
        tip;

      this.refreshCommercialAimPresentationV1();
    }

    refreshCommercialAimPresentationV1() {
      if (
        !this.aimGuide ||
        !this.aimGuideTip
      ) {
        return;
      }

      const viewer =
        this.snapshot
          ?.viewer
          ?.account_id;

      const one =
        this.snapshot
          ?.players
          ?.player_one;

      const two =
        this.snapshot
          ?.players
          ?.player_two;

      const active =
        one?.account_id ===
        viewer
          ? one
          : two?.account_id ===
            viewer
            ? two
            : null;

      const x =
        Number(
          active?.position_x
        );

      const y =
        Number(
          active?.position_y
        );

      const visible =
        this.isViewerTurn() &&
        Number.isFinite(x) &&
        Number.isFinite(y);

      this.aimGuide
        .clear()
        .setVisible(
          visible
        );

      this.aimGuideTip
        .setVisible(
          visible
        );

      if (!visible) {
        return;
      }

      const radians =
        Phaser.Math.DegToRad(
          this.aimAngleDeg
        );

      const facing =
        one?.account_id ===
        viewer
          ? 1
          : -1;

      const length =
        66;

      const endX =
        x +
        Math.cos(
          radians
        ) *
        length *
        facing;

      const endY =
        y -
        Math.sin(
          radians
        ) *
        length;

      this.aimGuide
        .lineStyle(
          3,
          0xffc267,
          0.88
        )
        .beginPath()
        .moveTo(
          x,
          y - 28
        )
        .lineTo(
          endX,
          endY - 28
        )
        .strokePath();

      this.aimGuideTip
        .setPosition(
          endX,
          endY - 28
        );
    }

    createCommercialPowerPresentationV1(
      world
    ) {
      const x =
        mapAsset.width / 2;

      const y =
        mapAsset.height - 76;

      const panel =
        this.add.container(
          x,
          y
        )
          .setDepth(
            CONTROL_DEPTH_V1
          );

      const background =
        this.add.rectangle(
          0,
          0,
          196,
          42,
          0x07111f,
          0.88
        )
          .setStrokeStyle(
            1,
            0xffb454,
            0.38
          );

      const label =
        this.add.text(
          -86,
          -14,
          "LỰC",
          {
            fontFamily:
              "Inter, Arial, sans-serif",
            fontSize:
              "9px",
            fontStyle:
              "bold",
            color:
              "#ffc267",
          }
        );

      const track =
        this.add.rectangle(
          -86,
          3,
          COMMERCIAL_HUD_V1.powerBarWidth,
          COMMERCIAL_HUD_V1.powerBarHeight,
          0x02060c,
          0.92
        )
          .setOrigin(
            0,
            0.5
          )
          .setStrokeStyle(
            1,
            0xffffff,
            0.14
          );

      const fill =
        this.add.rectangle(
          -85,
          3,
          COMMERCIAL_HUD_V1.powerBarWidth - 2,
          COMMERCIAL_HUD_V1.powerBarHeight - 2,
          0xff9b32,
          1
        )
          .setOrigin(
            0,
            0.5
          );

      const value =
        this.add.text(
          86,
          -5,
          "",
          {
            fontFamily:
              "Inter, Arial, sans-serif",
            fontSize:
              "12px",
            fontStyle:
              "bold",
            color:
              "#ffffff",
          }
        )
          .setOrigin(
            1,
            0.5
          );

      panel.add([
        background,
        label,
        track,
        fill,
        value,
      ]);

      world.add(
        panel
      );

      this.powerBarFill =
        fill;

      this.commercialHud.powerValue =
        value;

      this.refreshCommercialPowerPresentationV1();

    }

    refreshCommercialPowerPresentationV1() {
      if (
        !this.powerBarFill ||
        !this.commercialHud
          ?.powerValue
      ) {
        return;
      }

      const ratio =
        Math.max(
          0,
          Math.min(
            1,
            this.shotPower /
              POWER_MAX
          )
        );

      this.powerBarFill.displayWidth =
        (
          COMMERCIAL_HUD_V1.powerBarWidth -
          2
        ) *
        ratio;

      this.commercialHud
        .powerValue
        .setText(
          `${Math.round(
            this.shotPower
          )}%`
        );
    }

    refreshCommercialBattleHudV1() {
      const hud =
        this.commercialHud;

      if (!hud) {
        return;
      }

      const snapshot =
        this.snapshot;

      const one =
        snapshot
          ?.players
          ?.player_one;

      const two =
        snapshot
          ?.players
          ?.player_two;

      const oneName =
        one?.character
          ?.character_name ||
        "CHIẾN BINH 1";

      const twoName =
        two?.character
          ?.character_name ||
        "CHIẾN BINH 2";

      hud.playerOneName
        .setText(
          oneName
        );

      hud.playerTwoName
        .setText(
          twoName
        );

      const oneHp =
        Number(
          one?.current_hp ??
          snapshot
            ?.players
            ?.player_one_current_hp
        );

      const twoHp =
        Number(
          two?.current_hp ??
          snapshot
            ?.players
            ?.player_two_current_hp
        );

      hud.playerOneHp
        .setText(
          `HP ${displayHp(
            oneHp
          )}`
        );

      hud.playerTwoHp
        .setText(
          `HP ${displayHp(
            twoHp
          )}`
        );

      /*
       * No authoritative maximum-health contract exists here.
       * Bars therefore communicate remaining absolute
       * HP relative to the larger currently observed HP,
       * never inventing a gameplay maximum.
       */
      const observedMax =
        Math.max(
          Number.isFinite(oneHp)
            ? oneHp
            : 0,
          Number.isFinite(twoHp)
            ? twoHp
            : 0,
          1
        );

      const setHpWidth =
        (
          object,
          hp
        ) => {
          const ratio =
            Number.isFinite(hp)
              ? Math.max(
                  0,
                  Math.min(
                    1,
                    hp /
                      observedMax
                  )
                )
              : 0;

          object.displayWidth =
            (
              COMMERCIAL_HUD_V1.hpBarWidth -
              2
            ) *
            ratio;
        };

      setHpWidth(
        this.playerOneHpFill,
        oneHp
      );

      setHpWidth(
        this.playerTwoHpFill,
        twoHp
      );

      const remaining =
        remainingSeconds(
          snapshot
            ?.turn
            ?.turn_deadline_at
        );

      hud.timer
        .setText(
          remaining === null
            ? "—"
            : String(
                remaining
              )
        );

      hud.turnState
        .setText(
          this.isViewerTurn()
            ? "LƯỢT CỦA BẠN"
            : "LƯỢT ĐỐI THỦ"
        );

      const wind =
        displayWind(
          snapshot
            ?.world
            ?.initial_wind
        );

      hud.wind
        .setText(
          `GIÓ ĐẦU TRẬN  ${wind.arrow}  ${wind.text}`
        );

      this.refreshCommercialAimPresentationV1();
      this.refreshCommercialPowerPresentationV1();

    }

    isViewerTurn() {
      return (
        this.snapshot
          ?.turn
          ?.active_account_id ===
        this.snapshot
          ?.viewer
          ?.account_id
      );
    }

    refreshBattleControls() {
      this.angleText
        ?.setText(
          `GÓC ${this.aimAngleDeg}°`
        );

      this.powerText
        ?.setText(
          `LỰC ${this.shotPower}`
        );

      const turnNumber =
        Number(
          this.snapshot
            ?.turn
            ?.turn_number
        );

      const enabled =
        this.isViewerTurn() &&
        Number.isInteger(
          turnNumber
        ) &&
        this.firePendingTurn !==
          turnNumber;

      for (
        const control of
        this.controlButtons
      ) {
        if (enabled) {
          control
            .setInteractive({
              useHandCursor:
                true,
            })
            .setAlpha(
              1
            );
        } else {
          control
            .disableInteractive()
            .setAlpha(
              0.45
            );
        }
      }

      this.fireButton
        ?.text
        ?.setText(
          this.firePendingTurn ===
            turnNumber
            ? "ĐÃ BẮN"
            : "BẮN"
        );
    }

    async fireShot() {
      const turnNumber =
        Number(
          this.snapshot
            ?.turn
            ?.turn_number
        );

      if (
        this.terminalPresentation
          ?.completed ===
          true ||
        !this.isViewerTurn() ||
        !Number.isInteger(
          turnNumber
        ) ||
        this.firePendingTurn ===
          turnNumber
      ) {
        return;
      }

      if (
        typeof onFireIntent !==
        "function"
      ) {
        throw new Error(
          "Battle fire bridge Cing Piu Piu chưa được cấu hình"
        );
      }

      this.firePendingTurn =
        turnNumber;

      this.fireStatusText
        ?.setText(
          "ĐANG GỬI..."
        );

      this.refreshBattleControls();
      this.refreshCommercialBattleHudV1();

      try {
        await onFireIntent({
          turnNumber,

          angleDeg:
            this.aimAngleDeg,

          power:
            this.shotPower,
        });

        this.fireStatusText
          ?.setText(
            "ĐÃ NHẬN LỆNH"
          );

        this.firingPresentation
          ?.presentAcceptedFire?.({
            angleDeg:
              this.aimAngleDeg,

            power:
              this.shotPower,
          });
      } catch (error) {
        if (
          this.firePendingTurn ===
            turnNumber
        ) {
          this.firePendingTurn =
            null;

          this.fireStatusText
            ?.setText(
              error?.message ||
              "KHÔNG THỂ BẮN"
            );

          this.firingPresentation
            ?.cancelCharge?.();

          this.refreshBattleControls();
      this.refreshCommercialBattleHudV1();
        }
      }
    }

    handleSnapshot(
      snapshot
    ) {
      this.firingPresentation
        ?.setSnapshot?.(
          snapshot
        );

      this.applySnapshot(
        snapshot
      );
    }

    handleCanonicalResult(
      payload
    ) {
      const result =
        payload?.result;

      const resolve =
        payload?.resolve;

      const reject =
        payload?.reject;

      if (
        typeof resolve !==
          "function" ||
        typeof reject !==
          "function"
      ) {
        return;
      }

      void this
        .presentCanonicalShot(
          result
        )
        .then(
          resolve,
          reject
        );
    }

    async presentCanonicalShot(
      result
    ) {
      if (
        !result ||
        typeof result !==
          "object" ||
        !result.presentation ||
        !result.trajectory_presentation
      ) {
        throw new Error(
          "Canonical projectile presentation Cing Piu Piu không hợp lệ"
        );
      }

      if (
        this.presentationTween ||
        this.presentationProjectile
      ) {
        throw new Error(
          "Canonical projectile presentation Cing Piu Piu đang bận"
        );
      }

      const {
        start_x:
          startX,
        start_y:
          startY,
        impact_x:
          impactX,
        impact_y:
          impactY,
      } =
        result.presentation;

      const trajectory =
        result.trajectory_presentation;

      const samples =
        trajectory.samples;

      if (
        !Number.isFinite(
          startX
        ) ||
        !Number.isFinite(
          startY
        ) ||
        !Array.isArray(
          samples
        ) ||
        samples.length < 1 ||
        samples.length !==
          trajectory.sample_count
      ) {
        throw new Error(
          "Canonical projectile geometry Cing Piu Piu không hợp lệ"
        );
      }

      if (!this.world) {
        throw new Error(
          "Battle world Cing Piu Piu chưa sẵn sàng"
        );
      }

      const firstSample =
        samples[0];

      if (
        !Number.isFinite(
          firstSample?.x
        ) ||
        !Number.isFinite(
          firstSample?.y
        ) ||
        firstSample.elapsed_ms !==
          0 ||
        firstSample.x !==
          startX ||
        firstSample.y !==
          startY
      ) {
        throw new Error(
          "Canonical projectile start Cing Piu Piu không nhất quán"
        );
      }

      const projectile =
        this.add.container(
          firstSample.x,
          firstSample.y
        );

      const glow =
        this.add.circle(
          0,
          0,
          8,
          0xffc45c,
          0.22
        );

      const core =
        this.add.circle(
          0,
          0,
          4,
          0xfff1b8,
          1
        );

      core.setStrokeStyle(
        2,
        0xffa33c,
        1
      );

      projectile.add([
        glow,
        core,
      ]);

      this.world.add(
        projectile
      );

      this.presentationProjectile =
        projectile;

      const presentationCamera =
        this.cameras.main;

      if (!presentationCamera) {
        throw new Error(
          "Battle presentation camera Cing Piu Piu chưa sẵn sàng"
        );
      }

      const cameraState = {
        scrollX:
          presentationCamera.scrollX,
        scrollY:
          presentationCamera.scrollY,
        zoom:
          presentationCamera.zoom,
      };

      const worldScale =
        this.world.scaleX;

      if (
        !Number.isFinite(
          worldScale
        ) ||
        worldScale <= 0
      ) {
        throw new Error(
          "Battle world scale Cing Piu Piu không hợp lệ"
        );
      }

      const cameraTarget =
        this.add.zone(
          firstSample.x *
            worldScale,
          firstSample.y *
            worldScale,
          1,
          1
        );

      const trail =
        this.add.graphics();

      this.presentationCameraTarget =
        cameraTarget;

      this.presentationTrail =
        trail;

      presentationCamera.setZoom(
        1.08
      );

      presentationCamera.startFollow(
        cameraTarget,
        false,
        0.16,
        0.16
      );

      try {
        for (
          let index = 1;
          index < samples.length;
          index += 1
        ) {
          const previous =
            samples[
              index - 1
            ];

          const next =
            samples[
              index
            ];

          const segmentDurationMs =
            next.elapsed_ms -
            previous.elapsed_ms;

          if (
            !Number.isFinite(
              previous.x
            ) ||
            !Number.isFinite(
              previous.y
            ) ||
            !Number.isFinite(
              next.x
            ) ||
            !Number.isFinite(
              next.y
            ) ||
            !Number.isInteger(
              segmentDurationMs
            ) ||
            segmentDurationMs <= 0
          ) {
            throw new Error(
              "Canonical projectile timeline Cing Piu Piu không hợp lệ"
            );
          }

          const trailStartX =
            previous.x *
            worldScale;

          const trailStartY =
            previous.y *
            worldScale;

          const trailEndX =
            next.x *
            worldScale;

          const trailEndY =
            next.y *
            worldScale;

          trail.lineStyle(
            2,
            0xffd48a,
            0.44
          );

          trail.beginPath();

          trail.moveTo(
            trailStartX,
            trailStartY
          );

          trail.lineTo(
            trailEndX,
            trailEndY
          );

          trail.strokePath();

          await new Promise(
            (resolve) => {
              this.presentationTween =
                this.tweens.add({
                  targets:
                    projectile,

                  x:
                    next.x,

                  y:
                    next.y,

                  duration:
                    segmentDurationMs,

                  ease:
                    "Linear",

                  onUpdate:
                    () => {
                      cameraTarget.setPosition(
                        projectile.x *
                          worldScale,
                        projectile.y *
                          worldScale
                      );
                    },

                  onComplete:
                    () => {
                      cameraTarget.setPosition(
                        next.x *
                          worldScale,
                        next.y *
                          worldScale
                      );

                      this.presentationTween =
                        null;

                      resolve();
                    },
                });
            }
          );
        }

        const terminalSample =
          samples[
            samples.length - 1
          ];

        let terminalX =
          terminalSample.x;

        let terminalY =
          terminalSample.y;

        if (
          result.outcome ===
            "player_hit" ||
          result.outcome ===
            "terrain_hit"
        ) {
          if (
            !Number.isFinite(
              impactX
            ) ||
            !Number.isFinite(
              impactY
            )
          ) {
            throw new Error(
              "Canonical projectile impact Cing Piu Piu không hợp lệ"
            );
          }

          /*
           * Collision may occur between fixed-step samples.
           * The durable trajectory intentionally stops before
           * inventing any sample beyond exact collision.
           *
           * The exact canonical impact projection therefore owns
           * the final collision endpoint.
           */
          terminalX =
            impactX;

          terminalY =
            impactY;

          projectile.setPosition(
            impactX,
            impactY
          );
        } else {
          projectile.setPosition(
            terminalX,
            terminalY
          );
        }

        presentationCamera.stopFollow();

        presentationCamera.setZoom(
          cameraState.zoom
        );

        presentationCamera.setScroll(
          cameraState.scrollX,
          cameraState.scrollY
        );

        await this.presentCanonicalImpact(
          result,
          terminalX,
          terminalY
        );
      } finally {
        presentationCamera.stopFollow();

        presentationCamera.setZoom(
          cameraState.zoom
        );

        presentationCamera.setScroll(
          cameraState.scrollX,
          cameraState.scrollY
        );

        cameraTarget.destroy();

        trail.destroy();

        if (
          this.presentationCameraTarget ===
          cameraTarget
        ) {
          this.presentationCameraTarget =
            null;
        }

        if (
          this.presentationTrail ===
          trail
        ) {
          this.presentationTrail =
            null;
        }

        if (
          this.presentationTween
        ) {
          this.presentationTween
            .stop();

          this.presentationTween =
            null;
        }

        if (
          projectile.active
        ) {
          projectile.destroy();
        }

        if (
          this.presentationProjectile ===
          projectile
        ) {
          this.presentationProjectile =
            null;
        }
      }
    }




    resolveCanonicalHitPresentationTargetV1(
      result
    ) {
      if (
        result?.outcome !==
          "player_hit" ||
        typeof result
          ?.target_account_id !==
          "string" ||
        !result.target_account_id
      ) {
        return null;
      }

      const targetAccountId =
        result.target_account_id;

      const playerOne =
        this.snapshot
          ?.players
          ?.player_one;

      const playerTwo =
        this.snapshot
          ?.players
          ?.player_two;

      if (
        playerOne?.account_id ===
        targetAccountId
      ) {
        return {
          controller:
            this.playerOneCharacterController,

          renderer:
            this.playerOneCharacterRenderer,
        };
      }

      if (
        playerTwo?.account_id ===
        targetAccountId
      ) {
        return {
          controller:
            this.playerTwoCharacterController,

          renderer:
            this.playerTwoCharacterRenderer,
        };
      }

      return null;
    }

    presentCanonicalPlayerHitFeedbackV1(
      result,
      x,
      y
    ) {
      if (
        result?.outcome !==
        "player_hit"
      ) {
        return;
      }

      const target =
        this.resolveCanonicalHitPresentationTargetV1(
          result
        );

      target
        ?.controller
        ?.setState?.(
          CHARACTER_STATE_V1.HIT
        );

      target
        ?.renderer
        ?.setState?.(
          CHARACTER_STATE_V1.HIT
        );

      const damageText =
        typeof result.damage ===
          "string" &&
        /^(0|[1-9][0-9]*)$/u.test(
          result.damage
        )
          ? result.damage
          : null;

      if (
        !damageText ||
        damageText ===
          "0"
      ) {
        return;
      }

      const label =
        this.add
          .text(
            x,
            y - 36,
            `-${damageText}`,
            {
              fontFamily:
                "Inter, Arial, sans-serif",

              fontSize:
                "19px",

              fontStyle:
                "bold",

              color:
                "#fff1d4",

              stroke:
                "#7a2212",

              strokeThickness:
                5,
            }
          )
          .setOrigin(
            0.5
          )
          .setDepth(
            940
          )
          .setScale(
            0.78
          );

      this.world.add(
        label
      );

      this.tweens.add({
        targets:
          label,

        y:
          y - 62,

        scaleX:
          1.16,

        scaleY:
          1.16,

        alpha:
          0,

        duration:
          420,

        ease:
          "Cubic.easeOut",

        onComplete:
          () => {
            label.destroy();
          },
      });
    }

    waitForCanonicalImpactPacingV1(
      durationMs
    ) {
      if (
        !Number.isInteger(
          durationMs
        ) ||
        durationMs < 0 ||
        durationMs > 100
      ) {
        throw new Error(
          "Canonical impact pacing Cing Piu Piu không hợp lệ"
        );
      }

      if (
        durationMs ===
        0
      ) {
        return Promise.resolve();
      }

      return new Promise(
        resolve => {
          this.time.delayedCall(
            durationMs,
            resolve
          );
        }
      );
    }

    presentCanonicalVitalPulseV1(
      previousSnapshot,
      nextSnapshot
    ) {
      if (
        !previousSnapshot ||
        !nextSnapshot
      ) {
        return;
      }

      const previousOneHp =
        Number(
          previousSnapshot
            ?.vital
            ?.player_one_current_hp
        );

      const nextOneHp =
        Number(
          nextSnapshot
            ?.vital
            ?.player_one_current_hp
        );

      const previousTwoHp =
        Number(
          previousSnapshot
            ?.vital
            ?.player_two_current_hp
        );

      const nextTwoHp =
        Number(
          nextSnapshot
            ?.vital
            ?.player_two_current_hp
        );

      const pulse =
        (
          previousHp,
          nextHp,
          label,
          fill
        ) => {
          if (
            !Number.isFinite(
              previousHp
            ) ||
            !Number.isFinite(
              nextHp
            ) ||
            nextHp >= previousHp
          ) {
            return;
          }

          if (label) {
            this.tweens.add({
              targets:
                label,

              alpha:
                0.42,

              scaleX:
                1.08,

              scaleY:
                1.08,

              duration:
                70,

              yoyo:
                true,

              repeat:
                1,

              ease:
                "Quad.easeOut",
            });
          }

          if (fill) {
            this.tweens.add({
              targets:
                fill,

              alpha:
                0.34,

              scaleY:
                1.55,

              duration:
                70,

              yoyo:
                true,

              repeat:
                1,

              ease:
                "Quad.easeOut",
            });
          }
        };

      pulse(
        previousOneHp,
        nextOneHp,
        this.commercialHud
          ?.playerOneHp,
        this.playerOneHpFill
      );

      pulse(
        previousTwoHp,
        nextTwoHp,
        this.commercialHud
          ?.playerTwoHp,
        this.playerTwoHpFill
      );
    }

    presentCanonicalTurnHandoffV1(
      previousSnapshot,
      nextSnapshot
    ) {
      const previousTurn =
        Number(
          previousSnapshot
            ?.turn
            ?.turn_number
        );

      const nextTurn =
        Number(
          nextSnapshot
            ?.turn
            ?.turn_number
        );

      if (
        !Number.isInteger(
          previousTurn
        ) ||
        !Number.isInteger(
          nextTurn
        ) ||
        previousTurn ===
          nextTurn
      ) {
        return;
      }

      const turnState =
        this.commercialHud
          ?.turnState;

      if (!turnState) {
        return;
      }

      turnState
        .setAlpha(
          0.40
        )
        .setScale(
          0.90
        );

      this.tweens.add({
        targets:
          turnState,

        alpha:
          1,

        scaleX:
          1,

        scaleY:
          1,

        duration:
          180,

        ease:
          "Back.easeOut",
      });
    }
    async presentCanonicalImpact(
      result,
      x,
      y
    ) {
      const outcome =
        result?.outcome;

      if (
        !Number.isFinite(x) ||
        !Number.isFinite(y)
      ) {
        throw new Error(
          "Canonical impact presentation position Cing Piu Piu không hợp lệ"
        );
      }

      if (
        outcome !==
          "player_hit" &&
        outcome !==
          "terrain_hit" &&
        outcome !==
          "out_of_bounds"
      ) {
        throw new Error(
          "Canonical projectile outcome Cing Piu Piu không hỗ trợ"
        );
      }

      const camera =
        this.cameras.main;

      if (!camera) {
        throw new Error(
          "Battle impact camera Cing Piu Piu chưa sẵn sàng"
        );
      }

      if (
        outcome ===
        "out_of_bounds"
      ) {
        const missRing =
          this.add.circle(
            x,
            y,
            11,
            0x8bd8ff,
            0.12
          );

        missRing.setStrokeStyle(
          2,
          0xbfeaff,
          0.62
        );

        this.world.add(
          missRing
        );

        this.tweens.add({
          targets:
            missRing,

          scale:
            1.45,

          alpha:
            0,

          duration:
            180,

          ease:
            "Quad.easeOut",

          onComplete:
            () => {
              missRing.destroy();
            },
        });

        return;
      }

      const isPlayerHit =
        outcome ===
        "player_hit";

      if (isPlayerHit) {
        this.presentCanonicalPlayerHitFeedbackV1(
          result,
          x,
          y
        );
      }


      const accent =
        isPlayerHit
          ? 0xff6654
          : 0xffa83d;

      const coreRadius =
        isPlayerHit
          ? 18
          : 16;

      const ringRadius =
        isPlayerHit
          ? 28
          : 25;

      const flash =
        this.add.circle(
          x,
          y,
          coreRadius,
          0xffffff,
          0.92
        );

      const core =
        this.add.circle(
          x,
          y,
          coreRadius,
          accent,
          0.72
        );

      const ring =
        this.add.circle(
          x,
          y,
          ringRadius,
          accent,
          0.08
        );

      ring.setStrokeStyle(
        isPlayerHit
          ? 4
          : 3,
        0xfff0cf,
        0.92
      );

      const smoke =
        this.add.circle(
          x,
          y - 3,
          isPlayerHit
            ? 22
            : 19,
          0x5c6570,
          0.34
        );

      this.world.add([
        smoke,
        ring,
        core,
        flash,
      ]);

      const debrisCount =
        isPlayerHit
          ? 8
          : 10;

      const debris = [];

      for (
        let index = 0;
        index < debrisCount;
        index += 1
      ) {
        const angle =
          (
            Math.PI *
            2 *
            index
          ) /
          debrisCount;

        const distance =
          (
            isPlayerHit
              ? 28
              : 34
          ) +
          (
            index % 3
          ) *
          4;

        const fragment =
          this.add.circle(
            x,
            y,
            index % 2 === 0
              ? 3
              : 2,
            isPlayerHit
              ? 0xffd0a3
              : 0xd8b07a,
            0.92
          );

        this.world.add(
          fragment
        );

        debris.push(
          fragment
        );

        this.tweens.add({
          targets:
            fragment,

          x:
            x +
            Math.cos(angle) *
              distance,

          y:
            y +
            Math.sin(angle) *
              distance,

          alpha:
            0,

          scale:
            0.45,

          duration:
            240 +
            (
              index % 3
            ) *
            35,

          ease:
            "Quad.easeOut",

          onComplete:
            () => {
              fragment.destroy();
            },
        });
      }

      this.tweens.add({
        targets:
          flash,

        scale:
          isPlayerHit
            ? 2.1
            : 1.8,

        alpha:
          0,

        duration:
          isPlayerHit
            ? 105
            : 90,

        ease:
          "Quad.easeOut",

        onComplete:
          () => {
            flash.destroy();
          },
      });

      this.tweens.add({
        targets:
          core,

        scale:
          isPlayerHit
            ? 2.0
            : 1.75,

        alpha:
          0,

        duration:
          isPlayerHit
            ? 250
            : 220,

        ease:
          "Quad.easeOut",

        onComplete:
          () => {
            core.destroy();
          },
      });

      this.tweens.add({
        targets:
          ring,

        scale:
          isPlayerHit
            ? 2.35
            : 2.05,

        alpha:
          0,

        duration:
          isPlayerHit
            ? 330
            : 285,

        ease:
          "Cubic.easeOut",

        onComplete:
          () => {
            ring.destroy();
          },
      });

      this.tweens.add({
        targets:
          smoke,

        y:
          y -
          (
            isPlayerHit
              ? 24
              : 20
          ),

        scale:
          isPlayerHit
            ? 1.75
            : 1.55,

        alpha:
          0,

        duration:
          isPlayerHit
            ? 430
            : 360,

        ease:
          "Sine.easeOut",

        onComplete:
          () => {
            smoke.destroy();
          },
      });

      camera.shake(
        isPlayerHit
          ? 150
          : 110,
        isPlayerHit
          ? 0.0065
          : 0.0042
      );

      await this.waitForCanonicalImpactPacingV1(
        isPlayerHit
          ? 58
          : 42
      );

    }

    presentCommercialTerminalResultV1() {
      const terminal =
        this.terminalPresentation;

      if (
        !terminal ||
        terminal.completed !==
          true
      ) {
        if (
          this.terminalResultContainer
        ) {
          this.terminalResultContainer
            .setVisible(
              false
            );
        }

        return;
      }

      const victory =
        terminal.viewerResult ===
        "victory";

      const reason =
        terminal.completionReason ===
          TERMINAL_COMPLETION_REASON_V1
            .FELL_OUT_OF_WORLD
          ? (
              victory
                ? "ĐỐI THỦ RƠI KHỎI CHIẾN TRƯỜNG"
                : "BẠN ĐÃ RƠI KHỎI CHIẾN TRƯỜNG"
            )
          : (
              victory
                ? "ĐÃ HẠ GỤC ĐỐI THỦ"
                : "BẠN ĐÃ BỊ HẠ GỤC"
            );

      if (
        !this.terminalResultContainer
      ) {
        const shade =
          this.add
            .rectangle(
              mapAsset.width / 2,
              mapAsset.height / 2,
              mapAsset.width,
              mapAsset.height,
              0x06101c,
              0.58
            );

        const panel =
          this.add
            .rectangle(
              mapAsset.width / 2,
              mapAsset.height / 2,
              430,
              236,
              0x101c2b,
              0.97
            )
            .setStrokeStyle(
              3,
              0xffb347,
              0.92
            );

        const title =
          this.add
            .text(
              mapAsset.width / 2,
              mapAsset.height / 2 - 44,
              "",
              {
                fontFamily:
                  "Inter, Arial, sans-serif",

                fontSize:
                  "34px",

                fontStyle:
                  "bold",

                color:
                  "#fff2cf",

                stroke:
                  "#4c2208",

                strokeThickness:
                  6,
              }
            )
            .setOrigin(
              0.5
            );

        const reasonText =
          this.add
            .text(
              mapAsset.width / 2,
              mapAsset.height / 2 + 18,
              "",
              {
                fontFamily:
                  "Inter, Arial, sans-serif",

                fontSize:
                  "15px",

                fontStyle:
                  "bold",

                color:
                  "#ffd7a3",

                align:
                  "center",
              }
            )
            .setOrigin(
              0.5
            );

        const status =
          this.add
            .text(
              mapAsset.width / 2,
              mapAsset.height / 2 + 48,
              "TRẬN ĐẤU ĐÃ KẾT THÚC",
              {
                fontFamily:
                  "Inter, Arial, sans-serif",

                fontSize:
                  "11px",

                color:
                  "#aebdca",
              }
            )
            .setOrigin(
              0.5
            );

        const rematchButton =
          this.add
            .rectangle(
              mapAsset.width / 2 - 86,
              mapAsset.height / 2 + 88,
              154,
              42,
              0xf59a23,
              1
            )
            .setStrokeStyle(
              2,
              0xffd38a,
              1
            )
            .setInteractive({
              useHandCursor:
                true,
            });

        const rematchLabel =
          this.add
            .text(
              mapAsset.width / 2 - 86,
              mapAsset.height / 2 + 88,
              "ĐẤU LẠI",
              {
                fontFamily:
                  "Inter, Arial, sans-serif",

                fontSize:
                  "15px",

                fontStyle:
                  "bold",

                color:
                  "#ffffff",
              }
            )
            .setOrigin(
              0.5
            );

        rematchButton.on(
          "pointerdown",
          () => {
            if (
              this.terminalRematchRequested ===
                true
            ) {
              return;
            }

            if (
              typeof onRematchIntent !==
                "function"
            ) {
              throw new Error(
                "Battle rematch bridge Cing Piu Piu chưa được cấu hình"
              );
            }

            this.terminalRematchRequested =
              true;

            rematchButton
              .disableInteractive()
              .setAlpha(
                0.62
              );

            rematchLabel.setText(
              "CHỜ ĐỐI THỦ..."
            );

            void Promise.resolve(
              onRematchIntent({
                sourceMatchId:
                  this.snapshot
                    ?.match_id,
              })
            ).then(
              (result) => {
                if (
                  result?.status ===
                    "waiting"
                ) {
                  if (
                    rematchLabel.active
                  ) {
                    rematchLabel.setText(
                      "CHỜ ĐỐI THỦ..."
                    );
                  }

                  return;
                }

                if (
                  result?.status ===
                    "matched"
                ) {
                  if (
                    rematchLabel.active
                  ) {
                    rematchLabel.setText(
                      "ĐANG VÀO TRẬN..."
                    );
                  }

                  return;
                }

                throw new Error(
                  "Rematch presentation Cing Piu Piu không hợp lệ"
                );
              }
            ).catch(
              () => {
                this.terminalRematchRequested =
                  false;

                if (
                  rematchButton.active
                ) {
                  rematchButton
                    .setInteractive({
                      useHandCursor:
                        true,
                    })
                    .setAlpha(
                      1
                    );
                }

                if (
                  rematchLabel.active
                ) {
                  rematchLabel.setText(
                    "ĐẤU LẠI"
                  );
                }
              }
            );
          }
        );

        const exitButton =
          this.add
            .rectangle(
              mapAsset.width / 2 + 86,
              mapAsset.height / 2 + 88,
              154,
              42,
              0x26384b,
              1
            )
            .setStrokeStyle(
              2,
              0xffd38a,
              1
            )
            .setInteractive({
              useHandCursor:
                true,
            });

        const exitLabel =
          this.add
            .text(
              mapAsset.width / 2 + 86,
              mapAsset.height / 2 + 88,
              "THOÁT",
              {
                fontFamily:
                  "Inter, Arial, sans-serif",

                fontSize:
                  "15px",

                fontStyle:
                  "bold",

                color:
                  "#ffffff",
              }
            )
            .setOrigin(
              0.5
            );

        exitButton.on(
          "pointerdown",
          () => {
            if (
              this.terminalExitRequested ===
              true
            ) {
              return;
            }

            if (
              typeof onExitIntent !==
              "function"
            ) {
              throw new Error(
                "Battle exit bridge Cing Piu Piu chưa được cấu hình"
              );
            }

            this.terminalExitRequested =
              true;

            exitButton
              .disableInteractive()
              .setAlpha(
                0.62
              );

            exitLabel.setText(
              "ĐANG THOÁT..."
            );

            void Promise.resolve(
              onExitIntent()
            ).catch(
              () => {
                this.terminalExitRequested =
                  false;

                if (
                  exitButton.active
                ) {
                  exitButton
                    .setInteractive({
                      useHandCursor:
                        true,
                    })
                    .setAlpha(
                      1
                    );
                }

                if (
                  exitLabel.active
                ) {
                  exitLabel.setText(
                    "THOÁT"
                  );
                }
              }
            );
          }
        );

        this.terminalResultContainer =
          this.add
            .container(
              0,
              0,
              [
                shade,
                panel,
                title,
                reasonText,
                status,
                rematchButton,
                rematchLabel,
                exitButton,
                exitLabel,
              ]
            )
            .setDepth(
              1200
            );

        this.terminalResultTitle =
          title;

        this.terminalResultReason =
          reasonText;

        this.world.add(
          this.terminalResultContainer
        );
      }

      this.terminalResultTitle
        .setText(
          victory
            ? "CHIẾN THẮNG"
            : "THẤT BẠI"
        );

      this.terminalResultReason
        .setText(
          reason
        );

      this.terminalResultContainer
        .setVisible(
          true
        );
    }

    applySnapshot(
      snapshot
    ) {
      const previousSnapshot =
        this.snapshot;

      if (
        !snapshot ||
        snapshot.world?.map_id !==
          mapAsset.mapId
      ) {
        throw new Error(
          "Battle snapshot Cing Piu Piu không khớp render map"
        );
      }

      this.applyAuthoritativeTerrain(
        snapshot.terrain
      );

      this.snapshot =
        snapshot;

      this.terminalPresentation =
        projectTerminalPresentationV1(
          snapshot
        );

      const players =
        snapshot.players;

      const playerOne =
        players?.player_one;

      const playerTwo =
        players?.player_two;



      const playerOneCharacter =
        projectCharacterPresentationV1({
          slot:
            "player_one",

          player:
            playerOne,
        });

      const playerTwoCharacter =
        projectCharacterPresentationV1({
          slot:
            "player_two",

          player:
            playerTwo,
        });

      this.characterPresentation =
        Object.freeze({
          player_one:
            playerOneCharacter,

          player_two:
            playerTwoCharacter,
        });

      this.playerOneCharacterController
        .bindIdentity(
          playerOneCharacter
        );

      this.playerTwoCharacterController
        .bindIdentity(
          playerTwoCharacter
        );

      if (
        !this.playerOneCharacterRenderer &&
        this.textures.exists(
          characterTextureKeyForV1({
            gender:
              playerOneCharacter.gender,

            state:
              CHARACTER_STATE_V1.IDLE,
          })
        )
      ) {
        this.playerOneCharacterRenderer =
          createCharacterRendererV1({
            scene:
              this,

            container:
              this.playerOneMarker.container,

            identity:
              playerOneCharacter,
          });
      }

      if (
        !this.playerTwoCharacterRenderer &&
        this.textures.exists(
          characterTextureKeyForV1({
            gender:
              playerTwoCharacter.gender,

            state:
              CHARACTER_STATE_V1.IDLE,
          })
        )
      ) {
        this.playerTwoCharacterRenderer =
          createCharacterRendererV1({
            scene:
              this,

            container:
              this.playerTwoMarker.container,

            identity:
              playerTwoCharacter,
          });
      }

      this.applyAuthoritativePlayerMotion({
        marker:
          this.playerOneMarker,

        player:
          playerOne,

        slot:
          "player_one",
      });

      this.applyAuthoritativePlayerMotion({
        marker:
          this.playerTwoMarker,

        player:
          playerTwo,

        slot:
          "player_two",
      });

      const activeAccountId =
        snapshot.turn
          ?.active_account_id;

      this.playerOneCharacterController
        .setActive(
          activeAccountId ===
            snapshot.vital
              ?.player_one_account_id
        );

      this.playerTwoCharacterController
        .setActive(
          activeAccountId ===
            snapshot.vital
              ?.player_two_account_id
        );

      this.playerOneCharacterController
        .setState(
          playerOne
            ?.motion_state ===
            "falling"
            ? CHARACTER_STATE_V1.FALL
            : CHARACTER_STATE_V1.IDLE
        );

      this.playerTwoCharacterController
        .setState(
          playerTwo
            ?.motion_state ===
            "falling"
            ? CHARACTER_STATE_V1.FALL
            : CHARACTER_STATE_V1.IDLE
        );

      if (
        this.terminalPresentation
          ?.completed ===
        true
      ) {
        const winnerAccountId =
          this.terminalPresentation
            .winnerAccountId;

        this.playerOneCharacterController
          .setState(
            playerOne
              ?.account_id ===
              winnerAccountId
              ? CHARACTER_STATE_V1
                  .VICTORY
              : CHARACTER_STATE_V1
                  .DEFEAT
          );

        this.playerTwoCharacterController
          .setState(
            playerTwo
              ?.account_id ===
              winnerAccountId
              ? CHARACTER_STATE_V1
                  .VICTORY
              : CHARACTER_STATE_V1
                  .DEFEAT
          );

        this.playerOneCharacterController
          .setActive(
            false
          );

        this.playerTwoCharacterController
          .setActive(
            false
          );
      }

      if (
        this.playerOneCharacterRenderer
      ) {
        this.playerOneCharacterRenderer
          .setState(
            this.playerOneCharacterController
              .getState()
          );

        this.playerOneCharacterRenderer
          .setActive(
            this.playerOneCharacterController
              .isActive()
          );
      }

      if (
        this.playerTwoCharacterRenderer
      ) {
        this.playerTwoCharacterRenderer
          .setState(
            this.playerTwoCharacterController
              .getState()
          );

        this.playerTwoCharacterRenderer
          .setActive(
            this.playerTwoCharacterController
              .isActive()
          );
      }

      this.playerOneHp.setText(
        `P1 · HP ${displayHp(
          snapshot.vital
            ?.player_one_current_hp
        )}`
      );

      this.playerTwoHp.setText(
        `P2 · HP ${displayHp(
          snapshot.vital
            ?.player_two_current_hp
        )}`
      );

      this.turnText.setText(
        `TURN ${
          snapshot.turn
            ?.turn_number ?? "—"
        }`
      );

      const wind =
        displayWind(
          snapshot.world
            ?.initial_wind
        );

      this.windText.setText(
        `GIÓ ĐẦU TRẬN ${wind.arrow} ${wind.text}`
      );

      const viewerTurn =
        snapshot.turn
          ?.active_account_id ===
        snapshot.viewer
          ?.account_id;

      this.viewerText.setText(
        this.terminalPresentation
          ?.completed ===
          true
          ? (
              this.terminalPresentation
                .viewerResult ===
                "victory"
                ? "CHIẾN THẮNG"
                : "THẤT BẠI"
            )
          : viewerTurn
            ? "LƯỢT CỦA BẠN"
            : "LƯỢT ĐỐI THỦ"
      );

      this.presentCommercialTerminalResultV1();

      const currentTurnNumber =
        Number(
          snapshot.turn
            ?.turn_number
        );

      if (
        this.firePendingTurn !==
          null &&
        this.firePendingTurn !==
          currentTurnNumber
      ) {
        this.firePendingTurn =
          null;

        this.fireStatusText
          ?.setText(
            ""
          );
      }

      this.lastTimerValue =
        null;

      this.refreshTimer();
      this.refreshBattleControls();
      this.refreshCommercialBattleHudV1();

      this.presentCanonicalVitalPulseV1(
        previousSnapshot,
        snapshot
      );

      this.presentCanonicalTurnHandoffV1(
        previousSnapshot,
        snapshot
      );
    }

    refreshTimer() {
      if (!this.timerText) {
        return;
      }

      const seconds =
        remainingSeconds(
          this.snapshot
            ?.turn
            ?.turn_deadline_at
        );

      const value =
        seconds === null
          ? "—"
          : String(
              seconds
            );

      if (
        value ===
        this.lastTimerValue
      ) {
        return;
      }

      this.lastTimerValue =
        value;

      this.timerText.setText(
        `${value}s`
      );
    }

    update() {
      this.refreshTimer();

      if (
        this.commercialHud
      ) {
        const remaining =
          remainingSeconds(
            this.snapshot
              ?.turn
              ?.turn_deadline_at
          );

        this.commercialHud
          .timer
          .setText(
            remaining === null
              ? "—"
              : String(
                  remaining
                )
          );
      }
    }
  };
}

export {
  CANONICAL_RESULT_EVENT,
  SNAPSHOT_EVENT,
};
