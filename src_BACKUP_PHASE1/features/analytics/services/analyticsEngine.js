import loggerService from "@/services/logger/loggerService";

class AnalyticsEngine {

  track(event, payload = {}) {

    loggerService.info(
      `[ANALYTICS] ${event}`,
      payload
    );

  }

  screen(screenName) {

    this.track(
      "screen_view",
      {
        screenName,
      }
    );

  }

}

const analyticsEngine =
  new AnalyticsEngine();

export default
  analyticsEngine;