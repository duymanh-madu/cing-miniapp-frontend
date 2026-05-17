import {

  pushToast,

} from "./dopamineToastEngine";

export function showComboOverlay({

  combo,

  multiplier,

}) {

  pushToast({

    type:
      "combo",

    message:
      `🔥 ${combo} COMBO x${multiplier}`,

  });

}