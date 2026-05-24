import {
  useEffect,
} from "react";

import aiRuntimeBootstrap from "../aiRuntimeBootstrap";

import aiRuntimeRealtimeSocket from "../aiRuntimeRealtimeSocket";

import useAiRuntimeStore from "../aiRuntimeStore";

import AiRuntimeMetricsGrid from "../components/AiRuntimeMetricsGrid";

import AiInferenceFeed from "../components/AiInferenceFeed";

function AiRuntimePage() {

  const {

    aiRuntimeMetrics,

    realtimeInferenceEvents,

  } = useAiRuntimeStore();

  useEffect(() => {

    aiRuntimeBootstrap
      .bootstrap();

    aiRuntimeRealtimeSocket
      .initialize();

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
        AI Runtime Operating Platform
      </div>

      <AiRuntimeMetricsGrid
        metrics={
          aiRuntimeMetrics
        }
      />

      <AiInferenceFeed
        events={
          realtimeInferenceEvents
        }
      />

    </div>

  );

}

export default
  AiRuntimePage;