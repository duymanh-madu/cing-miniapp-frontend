import {
  waitForZaloSdk,
} from "./zaloSdkLoader";

export async function shareMiniApp({

  title,

  description,

}) {

  const zmp =
    await waitForZaloSdk();

  return zmp.shareApp({

    title,

    description,

  });

}