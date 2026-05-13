import useSocketStore from "../stores/socketStore";

/**
 * ============================================
 * USE REALTIME STATUS
 * ============================================
 */

function useRealtimeStatus() {
  return useSocketStore();
}

export default useRealtimeStatus;