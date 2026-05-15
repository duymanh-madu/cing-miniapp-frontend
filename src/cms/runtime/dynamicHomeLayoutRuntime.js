import remoteConfigRuntime from "./remoteConfigRuntime";

class DynamicHomeLayoutRuntime {

  getSections() {

    return remoteConfigRuntime
      .get(
        "homepage_layout",
        []
      );

  }

}

const dynamicHomeLayoutRuntime =
  new DynamicHomeLayoutRuntime();

export default
  dynamicHomeLayoutRuntime;