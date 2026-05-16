import {
  followOA,
} from "zmp-sdk/apis";

class FollowOARuntime {

  async requestFollow() {

    try {

      const oaId =
        import.meta.env
          .VITE_ZALO_OA_ID;

      if (!oaId) {

        console.warn(
          "missing zalo oa id"
        );

        return false;

      }

      await followOA({
        id: oaId,
      });

      return true;

    } catch (error) {

      console.warn(
        "follow oa failed",
        error
      );

      return false;

    }

  }

}

const followOARuntime =
  new FollowOARuntime();

export default
  followOARuntime;