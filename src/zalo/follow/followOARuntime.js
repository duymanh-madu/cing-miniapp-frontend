import { followOA } from "zmp-sdk/apis";

class FollowOARuntime {
  async follow() {
    try {
      const response =
        await followOA({
          id: "",
        });

      return {
        success: true,
        response,
      };
    } catch (error) {
      console.error(
        "follow oa failed",
        error
      );

      return {
        success: false,
        error,
      };
    }
  }
}

const followOARuntime =
  new FollowOARuntime();

export default followOARuntime;