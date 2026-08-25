import {
  resolveCingArtilleryMapAsset,
} from "../runtime/cingArtilleryMapAssets";

const SNAPSHOT_EVENT =
  "cing-artillery:battle-snapshot";

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

      const world =
        snapshot.world;

      this.playerOneMarker
        .container
        .setPosition(
          Number(
            world.player_one_x
          ),
          Number(
            world.player_one_y
          )
        );

      this.playerTwoMarker
        .container
        .setPosition(
          Number(
            world.player_two_x
          ),
          Number(
            world.player_two_y
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

      this.lastTimerValue =
        null;

      this.refreshTimer();
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
