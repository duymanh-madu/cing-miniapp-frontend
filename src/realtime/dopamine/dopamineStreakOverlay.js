import {

  pushToast,

} from "./dopamineToastEngine";

export function showStreakOverlay({

  streak,

}) {

  pushToast({

    type:
      "streak",

    message:
      `🔥 ${streak} DAY STREAK`,

  });

}