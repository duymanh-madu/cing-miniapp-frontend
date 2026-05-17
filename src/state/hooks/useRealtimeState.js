import {
  useAppStore,
} from "../store/appStore";

export function useRealtimeState() {

  return useAppStore(
    (state) => ({

      connected:
        state.connected,

      latency:
        state.latency,

    })
  );

}