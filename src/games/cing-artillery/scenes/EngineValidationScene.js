export default function createEngineValidationScene(
  Phaser
) {
  return class EngineValidationScene extends Phaser.Scene {
    constructor() {
      super({
        key: "EngineValidationScene",
      });
    }

    create() {
      const {
        width,
        height,
      } = this.scale;

      this.cameras.main.setBackgroundColor(
        "#07111f"
      );

      const horizon =
        this.add.rectangle(
          width * 0.5,
          height * 0.72,
          width * 1.4,
          height * 0.58,
          0x123456
        );

      horizon.setRotation(-0.04);

      const glow =
        this.add.circle(
          width * 0.72,
          height * 0.28,
          115,
          0xf4b860,
          0.88
        );

      glow.setBlendMode(
        Phaser.BlendModes.ADD
      );

      const platform =
        this.add.rectangle(
          width * 0.5,
          height * 0.78,
          width * 0.7,
          70,
          0x2c5f4d
        );

      platform.setStrokeStyle(
        4,
        0x74c69d,
        0.9
      );

      const projectile =
        this.add.circle(
          width * 0.25,
          height * 0.55,
          20,
          0xffd166
        );

      projectile.setStrokeStyle(
        5,
        0xffffff,
        0.8
      );

      this.tweens.add({
        targets: projectile,
        x: width * 0.75,
        y: height * 0.28,
        duration: 1250,
        ease: "Sine.easeInOut",
        yoyo: true,
        repeat: -1,
      });

      this.tweens.add({
        targets: glow,
        alpha: {
          from: 0.58,
          to: 0.95,
        },
        scale: {
          from: 0.92,
          to: 1.08,
        },
        duration: 1450,
        ease: "Sine.easeInOut",
        yoyo: true,
        repeat: -1,
      });

      this.add
        .text(
          width * 0.5,
          height * 0.12,
          "CING ARTILLERY",
          {
            fontFamily:
              "Arial, Helvetica, sans-serif",
            fontSize: "62px",
            fontStyle: "bold",
            color: "#ffffff",
            stroke: "#000000",
            strokeThickness: 8,
          }
        )
        .setOrigin(0.5);

      this.add
        .text(
          width * 0.5,
          height * 0.19,
          "Premium Engine Validation",
          {
            fontFamily:
              "Arial, Helvetica, sans-serif",
            fontSize: "27px",
            color: "#8ecae6",
          }
        )
        .setOrigin(0.5);
    }
  };
}
