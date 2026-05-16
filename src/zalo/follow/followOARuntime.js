import {
  followOA,
} from "zmp-sdk/apis";

class FollowOARuntime {

  async requestFollow() {

    /**
     * ============================================
     * VALIDATE OA ID
     * ============================================
     */

    const oaId =
      import.meta.env
        .VITE_ZALO_OA_ID;

    if (!oaId) {

      console.warn(
        "missing zalo oa id"
      );

      return {

        success: false,

      };

    }

    /**
     * ============================================
     * FOLLOW OA
     * ============================================
     */

    try {

      await followOA({

        id: oaId,

      });

      return {

        success: true,

      };

    } catch (error) {

      console.warn(
        "follow oa failed",
        error
      );

      return {

        success: false,

      };

    }

  }

}

const followOARuntime =
  new FollowOARuntime();

export default
  followOARuntime;