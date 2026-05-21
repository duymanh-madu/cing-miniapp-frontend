class GameHapticRuntime {

  tap() {

    if (
      navigator.vibrate
    ) {

      navigator.vibrate(
        10
      );

    }

  }

  collision() {

    if (
      navigator.vibrate
    ) {

      navigator.vibrate([
        50,
        30,
        50,
      ]);

    }

  }

}

const gameHapticRuntime =
  new GameHapticRuntime();

export default
  gameHapticRuntime;