import useConfigStore from "../stores/configStore";

/**
 * ============================================
 * USE FEATURE FLAG
 * ============================================
 */

function useFeatureFlag(
  featureKey
) {
  const features =
    useConfigStore(
      (state) =>
        state.config
          .features
    );

  return Boolean(
    features?.[
      featureKey
    ]
  );
}

export default useFeatureFlag;