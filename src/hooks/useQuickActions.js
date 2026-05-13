import useRuntimeStore from "../stores/runtimeStore";

/**
 * =========================================================
 * QUICK ACTIONS
 * =========================================================
 */

function useQuickActions() {

  const runtimeConfig =
    useRuntimeStore(
      (state) =>
        state.config
    );

  /**
   * =======================================================
   * ACTIONS
   * =======================================================
   */

  const actions =
    runtimeConfig
      ?.quickActions ||
    [];

  /**
   * =======================================================
   * FEATURES
   * =======================================================
   */

  const features =
    runtimeConfig
      ?.features ||
    {};

  /**
   * =======================================================
   * FILTER ENABLED
   * =======================================================
   */

  return actions.filter(
    (item) =>
      features[
        item.feature
      ]
  );

}

export default useQuickActions;