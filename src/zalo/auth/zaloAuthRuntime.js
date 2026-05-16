import {
  getAccessToken,
  getUserInfo,
  login,
} from "zmp-sdk/apis";

class ZaloAuthRuntime {

  constructor() {

    this.accessToken =
      null;

    this.profile =
      null;

  }

  /**
   * =====================================================
   * INITIALIZE
   * =====================================================
   */

  async initialize() {

    /**
     * ================================================
     * LOGIN
     * ================================================
     */

    try {

      await login({});

    } catch (error) {

      console.warn(
        "zalo login failed",
        error
      );

      return {

        success: false,

      };

    }

    /**
     * ================================================
     * ACCESS TOKEN
     * ================================================
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
     * ================================================
     * PROFILE
     * ================================================
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
     * ================================================
     * SUCCESS
     * ================================================
     */

    return {

      success: true,

      accessToken:
        this.accessToken,

      profile:
        this.profile,

    };

  }

  /**
   * =====================================================
   * BOOTSTRAP
   * =====================================================
   */

  async bootstrap() {

    return this.initialize();

  }

  /**
   * =====================================================
   * PROFILE
   * =====================================================
   */

  async getProfile() {

    if (!this.profile) {

      return {

        success: false,

        profile: null,

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