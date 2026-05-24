import {

  pushToast,

} from "./dopamineToastEngine";

export function showLevelOverlay({

  level,

}) {

  pushToast({

    type:
      "level",

    message:
      `🏆 LEVEL ${level}`,

  });

}