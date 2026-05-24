class GameAudioRuntime {

  sounds =
    new Map();

  preload() {

    const jump =
      new Audio(
        "/audio/jump.mp3"
      );

    const hit =
      new Audio(
        "/audio/hit.mp3"
      );

    const score =
      new Audio(
        "/audio/score.mp3"
      );

    this.sounds.set(
      "jump",
      jump
    );

    this.sounds.set(
      "hit",
      hit
    );

    this.sounds.set(
      "score",
      score
    );

  }

  play(
    key
  ) {

    const sound =
      this.sounds.get(
        key
      );

    if (
      !sound
    ) {

      return;

    }

    sound.currentTime =
      0;

    sound.play();

  }

}

const gameAudioRuntime =
  new GameAudioRuntime();

export default
  gameAudioRuntime;