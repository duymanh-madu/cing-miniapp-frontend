import useRealtimeStore from "@/stores/realtimeStore";

export function useRealtimeOverlay() {

  const overlays =
    useRealtimeStore(
      (state) =>
        state.overlays
    );

  const removeOverlay =
    useRealtimeStore(
      (state) =>
        state.removeOverlay
    );

  return {

    overlays,

    removeOverlay,

  };

}