import { useRuntimeSystemStore } from "@/runtime/system/runtimeSystemStore";

/**
 * =====================================================
 * SOCKET STATUS
 * =====================================================
 */

function useSocketStatus() {

  return useRuntimeSystemStore(
    (state) => state.connected
  );

}

export default useSocketStatus;
