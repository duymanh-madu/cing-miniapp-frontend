import {
  runtimeLogger,
} from "@/runtime/logger/runtimeLogger";

class ZaloAuthRuntime {

  constructor() {
    this.accessToken = null;
    this.profile = null;
  }

  async initialize() {

    let api;

    try {

      api =
        await import("zmp-sdk/apis");

    } catch (error) {

      runtimeLogger.warn(
        "ZALO",
        "zmp sdk api load failed",
        error
      );

      return {
        success: false,
      };

    }

    try {

      await api.login({});

    } catch (error) {

      runtimeLogger.warn(
        "ZALO",
        "zalo login failed",
        error
      );

      return {
        success: false,
      };

    }

    try {

      this.accessToken =
        await api.getAccessToken({});

    } catch (error) {

      runtimeLogger.warn(
        "ZALO",
        "zalo access token failed",
        error
      );

      return {
        success: false,
      };

    }

    try {

      this.profile =
        await api.getUserInfo({
          autoRequestPermission: true,
        });

    } catch (error) {

      runtimeLogger.warn(
        "ZALO",
        "zalo profile failed",
        error
      );

      return {
        success: false,
      };

    }

    return {
      success: true,
      accessToken: this.accessToken,
      profile: this.profile,
    };

  }

  async bootstrap() {
    return this.initialize();
  }

  async getProfile() {

    if (!this.profile) {
      return {
        success: false,
        profile: null,
      };
    }

    return {
      success: true,
      profile: this.profile,
    };

  }

}

const zaloAuthRuntime =
  new ZaloAuthRuntime();

export default zaloAuthRuntime;
