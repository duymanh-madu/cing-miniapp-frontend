import zaloAuthRuntime from "@/zalo/auth/zaloAuthRuntime";

import zaloPhoneRuntime from "@/zalo/phone/zaloPhoneRuntime";

import followOARuntime from "@/zalo/follow/followOARuntime";

import sessionRuntime from "@/zalo/session/sessionRuntime";

class ActivationService {

  async activate() {

    const auth =
      await zaloAuthRuntime
        .initialize();

    if (!auth) {
      return null;
    }

    const phone =
      await zaloPhoneRuntime
        .requestPhoneNumber();

    const followed =
      await followOARuntime
        .requestFollow();

    const payload = {

      auth,
      phone,
      followed,
      activatedAt:
        Date.now(),

    };

    sessionRuntime.save(
      payload
    );

    return payload;

  }

}

const activationService =
  new ActivationService();

export default activationService;