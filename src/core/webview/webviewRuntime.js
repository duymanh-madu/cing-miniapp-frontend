class WebviewRuntime {

  initialized =
    false;

  hidden =
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

        this.hidden =
          document.hidden;

      }

    );

    this.initialized =
      true;

  }

  isHidden() {

    return this.hidden;

  }

  isVisible() {

    return !this.hidden;

  }

}

const webviewRuntime =
  new WebviewRuntime();

export default
  webviewRuntime;