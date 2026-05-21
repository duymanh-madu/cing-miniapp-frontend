import useRealtimeStore from "@/stores/realtimeStore";

/**
 * =====================================================
 * SOCKET STATUS
 * =====================================================
 */

function useSocketStatus() {

  return useRealtimeStore(
    (
      state
    ) => state.connected
  );

}

export default useSocketStatus;