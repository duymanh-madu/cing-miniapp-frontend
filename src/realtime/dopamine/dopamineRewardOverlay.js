import {

  pushToast,

} from "./dopamineToastEngine";

export function showRewardOverlay({

  reward,

}) {

  pushToast({

    type:
      "reward",

    message:
      `🎁 ${reward.type}`,

  });

}