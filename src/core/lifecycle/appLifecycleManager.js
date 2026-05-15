import socketManager from "@/services/socket/socketManager";

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

         socketManager
            .disconnect();

        } else {

          socketManager
            .connect();

        }

      }

    );

    window.addEventListener(

      "beforeunload",

      () => {

        socketManager
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