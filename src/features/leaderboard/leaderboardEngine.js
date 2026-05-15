import leaderboardStore from "@/features/leaderboard/store/leaderboardStore";

class LeaderboardEngine {

  update(entries) {

    leaderboardStore
      .getState()
      .setEntries(entries);

  }

}

const leaderboardEngine =
  new LeaderboardEngine();

export default
  leaderboardEngine;