import remoteConfigRuntime from "./remoteConfigRuntime";

class DynamicFeatureFlagRuntime {

  enabled(
    key
  ) {

    return Boolean(

      remoteConfigRuntime
        .get(
          `feature_${key}`,
          false
        )

    );

  }

}

const dynamicFeatureFlagRuntime =
  new DynamicFeatureFlagRuntime();

export default
  dynamicFeatureFlagRuntime;