class VisibilityRuntime {

  listeners =
    [];

  initialize() {

    document.addEventListener(

      "visibilitychange",

      () => {

        this.listeners.forEach(
          (
            listener
          ) => {

            listener(
              !document.hidden
            );

          }
        );

      }

    );

  }

  subscribe(
    listener
  ) {

    this.listeners.push(
      listener
    );

  }

}

const visibilityRuntime =
  new VisibilityRuntime();

export default
  visibilityRuntime;