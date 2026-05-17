import {

  pushToast,

} from "./dopamineToastEngine";

export function showXPOverlay({

  earnedXP,

}) {

  pushToast({

    type:
      "xp",

    message:
      `⚡ +${earnedXP} XP`,

  });

}