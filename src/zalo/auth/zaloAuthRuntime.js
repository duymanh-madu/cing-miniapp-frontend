import {
  getAccessToken,
  getUserInfo,
} from "zmp-sdk/apis";

class ZaloAuthRuntime {

  constructor() {

    this.accessToken =
      null;

    this.profile =
      null;

  }

  async initialize() {

    /**
     * ============================================
     * ACCESS TOKEN
     * ============================================
     */

    try {

      this.accessToken =
        await getAccessToken({});

    } catch (error) {

      console.warn(
        "zalo access token failed",
        error
      );

      return {
        success: false,
      };

    }

    /**
     * ============================================
     * USER PROFILE
     * ============================================
     */

    try {

      this.profile =
        await getUserInfo({
          autoRequestPermission:
            true,
        });

    } catch (error) {

      console.warn(
        "zalo profile failed",
        error
      );

      return {
        success: false,
      };

    }

    /**
     * ============================================
     * SUCCESS
     * ============================================
     */

    return {

      success: true,

      accessToken:
        this.accessToken,

      profile:
        this.profile,

    };

  }

  async bootstrap() {

    return this.initialize();

  }

  async getProfile() {

    if (!this.profile) {

      return {
        success: false,
      };

    }

    return {

      success: true,

      profile:
        this.profile,

    };

  }

}

const zaloAuthRuntime =
  new ZaloAuthRuntime();

export default
  zaloAuthRuntime;