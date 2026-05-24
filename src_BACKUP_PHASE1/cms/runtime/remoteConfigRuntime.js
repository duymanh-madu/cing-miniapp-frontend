import remoteConfigApi from "@/cms/services/remoteConfigApi";

class RemoteConfigRuntime {

  config =
    {};

  initialized =
    false;

  async initialize() {

    if (
      this.initialized
    ) {

      return;

    }

    try {

      const response =
        await remoteConfigApi
          .fetch();

      this.config =
        response || {};

      this.initialized =
        true;

    } catch (error) {

      console.error(
        "remote config initialize failed",
        error
      );

    }

  }

  get(
    key,
    fallback = null
  ) {

    return (
      this.config[key] ??
      fallback
    );

  }

}

const remoteConfigRuntime =
  new RemoteConfigRuntime();

export default
  remoteConfigRuntime;