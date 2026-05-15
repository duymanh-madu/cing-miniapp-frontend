import socketConnectionManager from "@/core/socket-runtime/socketConnectionManager";

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

        socketConnectionManager
          .connect();

      }

    );

    window.addEventListener(

      "blur",

      () => {

        socketConnectionManager
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