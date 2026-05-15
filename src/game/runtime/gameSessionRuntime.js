class GameSessionRuntime {

  SESSION_KEY =
    "game_session";

  save(
    payload
  ) {

    localStorage.setItem(
      this.SESSION_KEY,
      JSON.stringify(
        payload
      )
    );

  }

  restore() {

    try {

      const raw =
        localStorage.getItem(
          this.SESSION_KEY
        );

      if (!raw) {

        return null;

      }

      return JSON.parse(
        raw
      );

    } catch (error) {

      console.error(
        "restore game session failed",
        error
      );

      return null;

    }

  }

}

const gameSessionRuntime =
  new GameSessionRuntime();

export default
  gameSessionRuntime;