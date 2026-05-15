import {
  getAccessToken,
  getUserInfo,
} from "zmp-sdk/apis";

class ZaloAuthRuntime {

  accessToken = null;

  profile = null;

  async initialize() {

    try {

      this.accessToken =
        await getAccessToken({});

      this.profile =
        await getUserInfo({
          autoRequestPermission: true,
        });

      return {
        accessToken:
          this.accessToken,
        profile:
          this.profile,
      };

    } catch (error) {

      console.error(
        "zalo auth initialize failed",
        error
      );

      return null;

    }

  }

  getProfile() {

    return this.profile;

  }

  getAccessTokenValue() {

    return this.accessToken;

  }

}

const zaloAuthRuntime =
  new ZaloAuthRuntime();

export default zaloAuthRuntime;