import {
  configAppView,
} from "zmp-sdk/apis";

class ZaloSdkRuntime {

  async initialize() {

    try {

      await configAppView({

        statusBarColor:
          "#000000",

        headerColor:
          "#000000",

      });

    } catch (
      error
    ) {

      console.error(
        "Zalo SDK init failed",
        error
      );

    }

  }

}

const zaloSdkRuntime =
  new ZaloSdkRuntime();

export default
  zaloSdkRuntime;