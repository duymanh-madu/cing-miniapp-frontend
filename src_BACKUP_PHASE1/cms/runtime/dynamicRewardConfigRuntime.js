import remoteConfigRuntime from "./remoteConfigRuntime";

class DynamicRewardConfigRuntime {

  getActivationReward() {

    return remoteConfigRuntime
      .get(
        "activation_reward",
        null
      );

  }

}

const dynamicRewardConfigRuntime =
  new DynamicRewardConfigRuntime();

export default
  dynamicRewardConfigRuntime;