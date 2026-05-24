import {
  useEffect,
} from "react";

import aiInsightsBootstrap from "../aiInsightsBootstrap";

import useAiInsightsStore from "../aiInsightsStore";

import AiRecommendationPanel from "../components/AiRecommendationPanel";

import AiPredictionPanel from "../components/AiPredictionPanel";

import AiInsightFeed from "../components/AiInsightFeed";

function AiInsightsPage() {

  const {

    recommendations,

    aiInsights,

    aiPredictions,

  } = useAiInsightsStore();

  useEffect(() => {

    aiInsightsBootstrap
      .bootstrap();

  }, []);

  return (

    <div
      className="
        space-y-6
      "
    >

      <div
        className="
          text-3xl
          font-black
        "
      >
        AI Operating Platform
      </div>

      <AiRecommendationPanel
        recommendations={
          recommendations
        }
      />

      <AiPredictionPanel
        predictions={
          aiPredictions
        }
      />

      <AiInsightFeed
        insights={
          aiInsights
        }
      />

    </div>

  );

}

export default
  AiInsightsPage;