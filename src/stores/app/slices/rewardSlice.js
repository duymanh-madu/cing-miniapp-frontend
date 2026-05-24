export const createRewardSlice =
  (set) => ({

    rewards: [],

    pushReward(reward) {

      set((state) => ({

        rewards: [

          reward,

          ...state.rewards,

        ].slice(0, 50),

      }));

    },

  });