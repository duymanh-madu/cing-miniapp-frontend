import useAnalyticsStore from "@/admin/analytics/analyticsStore";

function useRealtimeMetrics() {

  return useAnalyticsStore(
    (
      state
    ) => state.metrics
  );

}

export default
  useRealtimeMetrics;