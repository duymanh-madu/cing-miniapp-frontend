import {
  waitForZaloSdk,
} from "../services/zaloSdkLoader";

export async function bootstrapZaloLayer() {

  await waitForZaloSdk();

  console.log(
    "💙 Zalo layer booted"
  );

}