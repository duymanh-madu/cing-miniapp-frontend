import useFeatureFlagStore from "../featureFlags/featureFlagStore";

function useFeatureFlag(
  key
) {

  return useFeatureFlagStore(
    (
      state
    ) => state.flags?.[key]
  );

}

export default
  useFeatureFlag;