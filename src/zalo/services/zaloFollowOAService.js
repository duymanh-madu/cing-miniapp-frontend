import {
  waitForZaloSdk,
} from "./zaloSdkLoader";

export async function followOfficialAccount({

  oaId,

}) {

  const zmp =
    await waitForZaloSdk();

  return zmp.followOA({

    id:
      oaId,

  });

}