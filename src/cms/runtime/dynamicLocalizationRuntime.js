import remoteConfigRuntime from "./remoteConfigRuntime";

class DynamicLocalizationRuntime {

  t(
    key,
    fallback = ""
  ) {

    const dictionary =
      remoteConfigRuntime.get(
        "translations",
        {}
      );

    return (
      dictionary[key] ??
      fallback
    );

  }

}

const dynamicLocalizationRuntime =
  new DynamicLocalizationRuntime();

export default
  dynamicLocalizationRuntime;