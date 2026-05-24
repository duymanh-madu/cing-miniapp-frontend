import motionEngine from "@/runtime/animation/motionEngine";

/**
 * ============================================
 * ESPORTS UI STATE ENGINE
 * ============================================
 */

class EsportsState {
  constructor() {
    this.state = {
      mode: "normal", // normal | broadcast | celebration
    };

    motionEngine.subscribe(this.handleEvent);
  }

  handleEvent = (event) => {
    switch (event.type) {
      case "TOP_1":
        this.state.mode = "celebration";
        break;

      case "RANK_UP":
        this.state.mode = "broadcast";
        break;

      default:
        this.state.mode = "normal";
    }
  };

  getMode() {
    return this.state.mode;
  }
}

export default new EsportsState();