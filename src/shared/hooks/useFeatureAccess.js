import useConfigStore from "../stores/configStore";

/**
 * ============================================
 * USE FEATURE ACCESS
 * ============================================
 */

function useFeatureAccess(
  featureKey
) {
  const config =
    useConfigStore(
      (state) =>
        state.config
    );

  /**
   * MAINTENANCE MODE
   */

  if (
    config.maintenance_mode
  ) {
    return false;
  }

  /**
   * FEATURE FLAGS
   */

  return Boolean(
    config.features?.[
      featureKey
    ]
  );
}

export default useFeatureAccess;