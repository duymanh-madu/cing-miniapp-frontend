import socketManager from "@/services/socket/socketManager";
class WebviewResumeRuntime {

  initialized =
    false;

  initialize() {

    if (
      this.initialized
    ) {

      return;

    }

    window.addEventListener(

      "focus",

      () => {

        socketManager
          .connect();

      }

    );

    window.addEventListener(

      "blur",

      () => {

        socketManager
          .disconnect();

      }

    );

    this.initialized =
      true;

  }

}

const webviewResumeRuntime =
  new WebviewResumeRuntime();

export default
  webviewResumeRuntime;