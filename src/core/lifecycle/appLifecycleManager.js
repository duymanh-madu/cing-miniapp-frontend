import socketConnectionManager from "@/core/socket-runtime/socketConnectionManager";

class AppLifecycleManager {

  initialized =
    false;

  initialize() {

    if (
      this.initialized
    ) {

      return;

    }

    document.addEventListener(

      "visibilitychange",

      () => {

        if (
          document.hidden
        ) {

          socketConnectionManager
            .disconnect();

        } else {

          socketConnectionManager
            .connect();

        }

      }

    );

    window.addEventListener(

      "beforeunload",

      () => {

        socketConnectionManager
          .disconnect();

      }

    );

    this.initialized =
      true;

  }

}

const appLifecycleManager =
  new AppLifecycleManager();

export default
  appLifecycleManager;