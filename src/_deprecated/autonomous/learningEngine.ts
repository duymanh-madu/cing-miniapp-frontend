class LearningEngine {

  private history: any[] = [];

  learn(event: any) {
    this.history.push({
      ...event,
      timestamp: Date.now(),
    });
  }

  analyzePattern() {

    const patterns = {
      totalEvents: this.history.length,
      errorTrend: this.history.filter(e => e.type === "ERROR").length,
      successTrend: this.history.filter(e => e.type === "SUCCESS").length,
    };

    return patterns;
  }

}

export const learningEngine = new LearningEngine();
