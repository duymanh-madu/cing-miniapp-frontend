import {
  followOA,
} from "zmp-sdk/apis";

class FollowOARuntime {

  async requestFollow() {

    try {

      await followOA({
        id:
          import.meta.env
            .VITE_ZALO_OA_ID,
      });

      return true;

    } catch (error) {

      console.error(
        "follow oa failed",
        error
      );

      return false;

    }

  }

}

const followOARuntime =
  new FollowOARuntime();

export default followOARuntime;