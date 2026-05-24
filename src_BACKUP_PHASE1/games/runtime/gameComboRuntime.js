import realtimeGameStore from "@/games/store/gameRuntimeStore";

class GameComboRuntime {

  combo =
    0;

  increase() {

    this.combo++;

    realtimeGameStore
      .getState()
      .setCombo(
        this.combo
      );

  }

  reset() {

    this.combo =
      0;

    realtimeGameStore
      .getState()
      .setCombo(
        0
      );

  }

}

const gameComboRuntime =
  new GameComboRuntime();

export default
  gameComboRuntime;