import realtimeGameStore from "@/stores/realtimeGameStore";

class GamePhysicsRuntime {

  gravity = 0.42;

  jumpForce = -8.2;

  velocity = 0;

  playerY = 260;

  isDead = false;

  comboDifficulty = 0;

  jump() {

    if (this.isDead) {

      this.reset();

      return;

    }

    this.velocity =
      this.jumpForce;

  }

  reset() {

    this.velocity = 0;

    this.playerY = 260;

    this.isDead = false;

    realtimeGameStore
      .getState()
      .reset();

  }

  killPlayer() {

    this.isDead = true;

  }

  update() {

    if (this.isDead) {

      this.velocity += 0.9;

      this.playerY += this.velocity;

      return;

    }

    const score =
      realtimeGameStore
        .getState()
        .score;

    // =====================
    // DYNAMIC DIFFICULTY
    // =====================

    // 0 -> 10 combo:
    // cực dễ

    // sau đó tăng dần

    if (score < 10) {

      this.gravity = 0.36;

    }

    else if (score < 20) {

      this.gravity = 0.42;

    }

    else if (score < 40) {

      this.gravity = 0.48;

    }

    else {

      this.gravity = 0.54;

    }

    this.velocity +=
      this.gravity;

    this.playerY +=
      this.velocity;

    // =====================
    // CEILING
    // =====================

    if (this.playerY < 0) {

      this.playerY = 0;

      this.velocity = 0;

    }

    // =====================
    // FLOOR DEATH
    // =====================

    if (this.playerY > 520) {

      this.killPlayer();

    }

    realtimeGameStore
      .getState()
      .setScore(
        Math.floor(
          realtimeGameStore
            .getState()
            .tick / 10
        )
      );

  }

}

const gamePhysicsRuntime =
  new GamePhysicsRuntime();

export default gamePhysicsRuntime;