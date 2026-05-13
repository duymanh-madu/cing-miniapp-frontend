import useUIStore from "../stores/uiStore";

/**
 * ============================================
 * USE GLOBAL LOADING
 * ============================================
 */

function useGlobalLoading() {
  const globalLoading =
    useUIStore(
      (state) =>
        state.globalLoading
    );

  const setGlobalLoading =
    useUIStore(
      (state) =>
        state.setGlobalLoading
    );

  return {
    globalLoading,

    setGlobalLoading,
  };
}

export default useGlobalLoading;