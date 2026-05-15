import remoteConfigRuntime from "./remoteConfigRuntime";

class NavigationRuntime {

  getNavigation() {

    return remoteConfigRuntime
      .get(
        "navigation",
        []
      );

  }

}

const navigationRuntime =
  new NavigationRuntime();

export default
  navigationRuntime;