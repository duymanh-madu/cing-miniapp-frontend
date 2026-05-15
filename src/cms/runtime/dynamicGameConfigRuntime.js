import remoteConfigRuntime from "./remoteConfigRuntime";

class DynamicGameConfigRuntime {

  getGameConfig() {

    return remoteConfigRuntime
      .get(
        "game_config",
        {}
      );

  }

}

const dynamicGameConfigRuntime =
  new DynamicGameConfigRuntime();

export default
  dynamicGameConfigRuntime;