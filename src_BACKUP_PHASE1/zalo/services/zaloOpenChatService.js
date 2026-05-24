import {
  waitForZaloSdk,
} from "./zaloSdkLoader";

export async function openOAChat({

  oaId,

}) {

  const zmp =
    await waitForZaloSdk();

  return zmp.openChat({

    type:
      "oa",

    id:
      oaId,

  });

}