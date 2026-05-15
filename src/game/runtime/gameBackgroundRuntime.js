class GameBackgroundRuntime {

  offset =
    0;

  update() {

    this.offset -=
      1;

  }

}

const gameBackgroundRuntime =
  new GameBackgroundRuntime();

export default
  gameBackgroundRuntime;