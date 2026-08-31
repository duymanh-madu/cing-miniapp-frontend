import {
  resolveCingArtilleryMapAsset,
} from "../runtime/cingArtilleryMapAssets";

const SNAPSHOT_EVENT =
  "cing-artillery:battle-snapshot";

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
    }

    preload() {
      this.load.svg(
        "cing-piu-piu-map",
        mapAsset.renderAsset,
        {
          width:
            mapAsset.width,

          height:
            mapAsset.height,
        }
      );
    }

    create() {
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

      world.setScale(
        scaleX
      );

      world.add(
        this.add
          .image(
            mapAsset.width / 2,
            mapAsset.height / 2,
            "cing-piu-piu-map"
          )
          .setDisplaySize(
            mapAsset.width,
            mapAsset.height
          )
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

      this.playerTwoMarker =
        this.createPlayerMarker({
          world,
          label:
            "P2",
          accent:
            0x64c7ff,
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

      this.game.events.on(
        SNAPSHOT_EVENT,
        this.handleSnapshot,
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
        }
      );

      this.applySnapshot(
        this.snapshot
      );
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
      const y =
        mapAsset.height -
        92;

      this.createControlButton({
        world,
        x:
          84,
        y,
        width:
          42,
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
            146,
            y,
            "",
            {
              fontFamily:
                "Inter, Arial, sans-serif",

              fontSize:
                "14px",

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
          208,
        y,
        width:
          42,
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
          mapAsset.width -
          250,
        y,
        width:
          42,
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

      this.powerText =
        this.add
          .text(
            mapAsset.width -
              174,
            y,
            "",
            {
              fontFamily:
                "Inter, Arial, sans-serif",

              fontSize:
                "14px",

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
        this.powerText
      );

      this.createControlButton({
        world,
        x:
          mapAsset.width -
          98,
        y,
        width:
          42,
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
            mapAsset.width /
            2,
          y,
          width:
            116,
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
            mapAsset.width /
              2,
            y + 30,
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

          this.refreshBattleControls();
        }
      }
    }

    handleSnapshot(
      snapshot
    ) {
      this.applySnapshot(
        snapshot
      );
    }

    applySnapshot(
      snapshot
    ) {
      if (
        !snapshot ||
        snapshot.world?.map_id !==
          mapAsset.mapId
      ) {
        throw new Error(
          "Battle snapshot Cing Piu Piu không khớp render map"
        );
      }

      this.snapshot =
        snapshot;

      const players =
        snapshot.players;

      const playerOne =
        players?.player_one;

      const playerTwo =
        players?.player_two;

      if (
        !Number.isInteger(
          Number(
            playerOne?.position_x
          )
        ) ||
        !Number.isInteger(
          Number(
            playerOne?.position_y
          )
        ) ||
        !Number.isInteger(
          Number(
            playerTwo?.position_x
          )
        ) ||
        !Number.isInteger(
          Number(
            playerTwo?.position_y
          )
        )
      ) {
        throw new Error(
          "Mutable player world snapshot Cing Piu Piu không hợp lệ"
        );
      }

      this.playerOneMarker
        .container
        .setPosition(
          Number(
            playerOne.position_x
          ),
          Number(
            playerOne.position_y
          )
        );

      this.playerTwoMarker
        .container
        .setPosition(
          Number(
            playerTwo.position_x
          ),
          Number(
            playerTwo.position_y
          )
        );

      const activeAccountId =
        snapshot.turn
          ?.active_account_id;

      this.playerOneMarker
        .outer
        .setAlpha(
          activeAccountId ===
            snapshot.vital
              ?.player_one_account_id
            ? 1
            : 0.55
        );

      this.playerTwoMarker
        .outer
        .setAlpha(
          activeAccountId ===
            snapshot.vital
              ?.player_two_account_id
            ? 1
            : 0.55
        );

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
        viewerTurn
          ? "LƯỢT CỦA BẠN"
          : "LƯỢT ĐỐI THỦ"
      );

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
    }
  };
}

export {
  SNAPSHOT_EVENT,
};
