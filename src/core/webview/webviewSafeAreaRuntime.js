class WebviewSafeAreaRuntime {

  initialize() {

    document.documentElement
      .style.setProperty(

        "--safe-area-top",

        "env(safe-area-inset-top)"

      );

    document.documentElement
      .style.setProperty(

        "--safe-area-bottom",

        "env(safe-area-inset-bottom)"

      );

  }

}

const webviewSafeAreaRuntime =
  new WebviewSafeAreaRuntime();

export default
  webviewSafeAreaRuntime;