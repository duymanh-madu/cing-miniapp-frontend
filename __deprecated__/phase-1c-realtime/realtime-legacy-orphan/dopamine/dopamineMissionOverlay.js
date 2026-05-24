import {

  pushToast,

} from "./dopamineToastEngine";

export function showMissionOverlay({

  mission,

}) {

  pushToast({

    type:
      "mission",

    message:
      `✅ ${mission.title}`,

  });

}