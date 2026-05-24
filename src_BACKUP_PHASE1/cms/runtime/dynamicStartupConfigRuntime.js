import remoteConfigRuntime from "./remoteConfigRuntime";

class DynamicStartupConfigRuntime {

  getStartupConfig() {

    return remoteConfigRuntime
      .get(
        "startup",
        {}
      );

  }

}

const dynamicStartupConfigRuntime =
  new DynamicStartupConfigRuntime();

export default
  dynamicStartupConfigRuntime;