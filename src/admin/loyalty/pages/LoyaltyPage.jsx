import {
  useEffect,
} from "react";

import loyaltyBootstrap from "../loyaltyBootstrap";

import loyaltyRealtimeSocket from "../loyaltyRealtimeSocket";

import useLoyaltyStore from "../loyaltyStore";

import LoyaltyMetricsGrid from "../components/LoyaltyMetricsGrid";

import RewardBuilderForm from "../components/RewardBuilderForm";

function LoyaltyPage() {

  const metrics =
    useLoyaltyStore(
      (
        state
      ) => state.loyaltyMetrics
    );

  useEffect(() => {

    loyaltyBootstrap
      .bootstrap();

    loyaltyRealtimeSocket
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
        Loyalty Operating Platform
      </div>

      <LoyaltyMetricsGrid
        metrics={metrics}
      />

      <RewardBuilderForm />

    </div>

  );

}

export default
  LoyaltyPage;