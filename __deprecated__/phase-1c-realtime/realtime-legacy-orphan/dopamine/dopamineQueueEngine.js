import {

  shiftToast,

} from "./dopamineToastEngine";

let processing =
  false;

export async function processDopamineQueue({

  onToast,

}) {

  if (processing) {

    return;

  }

  processing =
    true;

  while (true) {

    const toast =
      shiftToast();

    if (toast) {

      onToast(
        toast
      );

      await new Promise(

        (
          resolve
        ) =>

          setTimeout(
            resolve,
            1800
          )

      );

    } else {

      await new Promise(

        (
          resolve
        ) =>

          setTimeout(
            resolve,
            250
          )

      );

    }

  }

}