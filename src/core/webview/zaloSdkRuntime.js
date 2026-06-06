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

    } catch (error) {

      console.warn(
        "Zalo SDK init failed",
        error
      );

      return null;

    }

  }

}

const zaloSdkRuntime =
  new ZaloSdkRuntime();

export default
  zaloSdkRuntime;