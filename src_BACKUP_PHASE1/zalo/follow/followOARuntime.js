import {
  runtimeLogger,
} from "@/runtime/logger/runtimeLogger";

class FollowOARuntime {

  async requestFollow() {

    try {

      const oaId =
        import.meta.env
          .VITE_ZALO_OA_ID;

      if (!oaId) {

        runtimeLogger.warn(
          "ZALO",
          "missing zalo oa id"
        );

        return false;

      }

      const {
        followOA,
      } = await import("zmp-sdk/apis");

      await followOA({
        id: oaId,
      });

      return true;

    } catch (error) {

      runtimeLogger.warn(
        "ZALO",
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
