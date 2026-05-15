import { getUserInfo, getAccessToken } from "zmp-sdk/apis";

class ZaloAuthRuntime {
  constructor() {
    this.initialized = false;
  }

  async bootstrap() {
    try {
      const accessToken = await getAccessToken({});

      return {
        success: true,
        accessToken,
      };
    } catch (error) {
      console.error("zalo auth bootstrap failed", error);

      return {
        success: false,
        error,
      };
    }
  }

  async getProfile() {
    try {
      const response = await getUserInfo({});

      return {
        success: true,
        profile: response.userInfo,
      };
    } catch (error) {
      console.error("get profile failed", error);

      return {
        success: false,
        error,
      };
    }
  }
}

const zaloAuthRuntime = new ZaloAuthRuntime();

export default zaloAuthRuntime;