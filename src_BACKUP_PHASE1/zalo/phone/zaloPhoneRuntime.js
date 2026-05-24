import {
  runtimeLogger,
} from "@/runtime/logger/runtimeLogger";

class ZaloPhoneRuntime {

  async requestPhoneNumber() {

    try {

      const {
        getPhoneNumber,
      } = await import("zmp-sdk/apis");

      const phone =
        await getPhoneNumber({});

      return {
        success: true,
        phone,
      };

    } catch (error) {

      runtimeLogger.warn(
        "ZALO",
        "phone request failed",
        error
      );

      return {
        success: false,
        phone: null,
      };

    }

  }

}

const zaloPhoneRuntime =
  new ZaloPhoneRuntime();

export default
  zaloPhoneRuntime;
