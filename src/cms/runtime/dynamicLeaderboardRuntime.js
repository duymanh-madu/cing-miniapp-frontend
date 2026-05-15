import remoteConfigRuntime from "./remoteConfigRuntime";

class DynamicLeaderboardRuntime {

  getLeaderboardConfig() {

    return remoteConfigRuntime
      .get(
        "leaderboard",
        {}
      );

  }

}

const dynamicLeaderboardRuntime =
  new DynamicLeaderboardRuntime();

export default
  dynamicLeaderboardRuntime;