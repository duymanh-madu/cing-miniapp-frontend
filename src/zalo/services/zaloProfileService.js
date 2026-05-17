import {
  waitForZaloSdk,
} from "./zaloSdkLoader";

export async function fetchZaloProfile() {

  const zmp =
    await waitForZaloSdk();

  return zmp.getUserInfo();

}