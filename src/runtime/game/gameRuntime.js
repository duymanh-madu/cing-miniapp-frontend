/**
 * 🎮 GAME RUNTIME CORE — ENTERPRISE FINAL v1
 * ==========================================
 * Unified game lifecycle controller
 * - register / start / stop games
 * - safe score emission pipeline
 * - prevents runtime memory leaks
 * - Zalo WebView optimized
 * ==========================================
 */

class GameRuntime {
  constructor() {
    /**
     * Registered games map
     * key: gameId
     * value: game instance
     */
    this.games = new Map();

    /**
     * Currently active game
     */
    this.activeGame = null;

    /**
     * Runtime state tracking
     */
    this.states = new Map();
  }

  /**
   * 🎯 Register a game into runtime
   */
  register(gameId, gameInstance) {
    if (!gameId || !gameInstance) return;

    this.games.set(gameId, gameInstance);

    this.states.set(gameId, {
      started: false,
      lastScore: 0,
      createdAt: Date.now(),
    });
  }

  /**
   * 🚀 Start a game safely
   */
  start(gameId) {
    const game = this.games.get(gameId);
    if (!game) return;

    // stop previous game if exists
    if (this.activeGame && this.activeGame !== gameId) {
      this.stop(this.activeGame);
    }

    this.activeGame = gameId;

    const state = this.states.get(gameId);
    if (state) {
      state.started = true;
      state.startedAt = Date.now();
    }

    if (typeof game.start === "function") {
      game.start();
    }
  }

  /**
   * 🛑 Stop a game safely
   */
  stop(gameId) {
    const game = this.games.get(gameId);
    if (!game) return;

    const state = this.states.get(gameId);
    if (state) {
      state.started = false;
      state.stoppedAt = Date.now();
    }

    if (typeof game.stop === "function") {
      game.stop();
    }

    if (this.activeGame === gameId) {
      this.activeGame = null;
    }
  }

  /**
   * 🎯 Emit score from game → leaderboard pipeline
   */
  emitScore(gameId, payload) {
    const game = this.games.get(gameId);
    if (!game) return;

    const state = this.states.get(gameId);

    // update runtime state
    if (state) {
      state.lastScore = payload?.score || 0;
    }

    // forward to game handler if exists
    if (typeof game.onScore === "function") {
      game.onScore(payload);
    }

    // optional hook for external systems (leaderboard, analytics)
    if (typeof this.onGlobalScore === "function") {
      this.onGlobalScore(gameId, payload);
    }
  }

  /**
   * 🔌 Global hook (leaderboard / CRM / analytics)
   */
  setGlobalScoreHandler(fn) {
    this.onGlobalScore = fn;
  }

  /**
   * 📊 Get runtime state
   */
  getState(gameId) {
    return this.states.get(gameId);
  }

  /**
   * 📌 Get active game
   */
  getActiveGame() {
    return this.activeGame;
  }

  /**
   * 🧹 Cleanup (important for WebView memory safety)
   */
  destroy(gameId) {
    const game = this.games.get(gameId);
    if (game && typeof game.destroy === "function") {
      game.destroy();
    }

    this.games.delete(gameId);
    this.states.delete(gameId);

    if (this.activeGame === gameId) {
      this.activeGame = null;
    }
  }
}

export default new GameRuntime();