import zaloAuthRuntime from "@/zalo/auth/zaloAuthRuntime";

import useActivationStore from "./activationStore";

import { activateMiniAppUser } from "./activationApi";

class ActivationRuntime {
  async activate() {
    const activationStore =
      useActivationStore.getState();

    try {
      activationStore.setLoading(true);

      const auth =
        await zaloAuthRuntime.bootstrap();

      if (!auth.success) {
        throw new Error("auth failed");
      }

      const profileResponse =
        await zaloAuthRuntime.getProfile();

      if (!profileResponse.success) {
        throw new Error("profile failed");
      }

      const activationResponse =
        await activateMiniAppUser({
          accessToken: auth.accessToken,
          profile: profileResponse.profile,
        });

      activationStore.activate({
        accessToken: auth.accessToken,
        profile: profileResponse.profile,
        jwt: activationResponse.jwt,
      });

      localStorage.setItem(
        "miniapp_jwt",
        activationResponse.jwt
      );

      return {
        success: true,
      };
    } catch (error) {
      console.error("activation failed", error);

      return {
        success: false,
        error,
      };
    } finally {
      activationStore.setLoading(false);
    }
  }
}

const activationRuntime =
  new ActivationRuntime();

export default activationRuntime;