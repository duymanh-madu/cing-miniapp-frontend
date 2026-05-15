import realtimeCustomerStore from "@/stores/realtimeCustomerStore";

class CustomerLeaderboardRuntime {

  leaderboard =
    [];

  setLeaderboard(
    payload
  ) {

    this.leaderboard =
      payload;

  }

  getLeaderboard() {

    return this.leaderboard;

  }

  syncMyRank(
    rank
  ) {

    realtimeCustomerStore
      .getState()
      .setRank(
        rank
      );

  }

}

const customerLeaderboardRuntime =
  new CustomerLeaderboardRuntime();

export default
  customerLeaderboardRuntime;