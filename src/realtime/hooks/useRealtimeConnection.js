import {
  useRealtimeConnectionStore,
} from "../store/realtimeConnectionStore";

export function useRealtimeConnection() {

  return useRealtimeConnectionStore(
    (state) => ({

      connected:
        state.connected,

      reconnecting:
        state.reconnecting,

      latency:
        state.latency,

    })
  );

}