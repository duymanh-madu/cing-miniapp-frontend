class GameRuntime {
  register(gameId, instance) {
    if (!gameId || !instance) return;

    this.games.set(gameId, instance);
  }

  start(gameId) {
    const game = this.games.get(gameId);
    if (!game || typeof game.start !== "function") return;

    this.activeGame = gameId;

    try {
      game.start();
    } catch (e) {
      console.error("[GAME START ERROR]", e);
    }
  }
}