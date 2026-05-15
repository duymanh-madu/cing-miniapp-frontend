class ActivationRuntime {

  async activate() {

    let auth = null;

    try {

      auth =
        await zaloAuthRuntime.bootstrap();

    } catch (error) {

      console.warn(
        "Zalo auth bootstrap failed",
        error
      );

      return null;

    }

    if (!auth?.success) {

      console.warn(
        "Zalo auth unavailable"
      );

      return null;

    }

    let profileResponse = null;

    try {

      profileResponse =
        await zaloAuthRuntime.getProfile();

    } catch (error) {

      console.warn(
        "Zalo profile fetch failed",
        error
      );

      return null;

    }

    if (!profileResponse?.success) {

      console.warn(
        "Zalo profile unavailable"
      );

      return null;

    }

    let activationResponse = null;

    try {

      activationResponse =
        await activateMiniAppUser({

          accessToken:
            auth.accessToken,

          profile:
            profileResponse.profile,

        });

    } catch (error) {

      console.warn(
        "Mini app activation failed",
        error
      );

      return null;

    }

    activationStore.activate({

      profile:
        profileResponse.profile,

      accessToken:
        auth.accessToken,

      customer:
        activationResponse?.customer,

    });

    return activationResponse;

  }

}

const activationRuntime =
  new ActivationRuntime();

export default
  activationRuntime;