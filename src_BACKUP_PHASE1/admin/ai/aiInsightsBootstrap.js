import aiInsightsService from "./aiInsightsService";

import useAiInsightsStore from "./aiInsightsStore";

class AiInsightsBootstrap {

  initialized =
    false;

  async bootstrap() {

    if (
      this.initialized
    ) {

      return;

    }

    const [

      recommendations,

      aiInsights,

      aiPredictions,

    ] = await Promise.all([

      aiInsightsService
        .getRecommendations(),

      aiInsightsService
        .getInsights(),

      aiInsightsService
        .getPredictions(),

    ]);

    const store =
      useAiInsightsStore
        .getState();

    store.setRecommendations(
      recommendations
    );

    store.setAiInsights(
      aiInsights
    );

    store.setAiPredictions(
      aiPredictions
    );

    this.initialized =
      true;

  }

}

const aiInsightsBootstrap =
  new AiInsightsBootstrap();

export default
  aiInsightsBootstrap;