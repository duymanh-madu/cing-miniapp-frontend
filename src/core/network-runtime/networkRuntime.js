class NetworkRuntime {

  listeners =
    [];

  online =
    navigator.onLine;

  initialize() {

    window.addEventListener(
      "online",
      () => {

        this.online =
          true;

        this.notify();

      }
    );

    window.addEventListener(
      "offline",
      () => {

        this.online =
          false;

        this.notify();

      }
    );

  }

  subscribe(
    callback
  ) {

    this.listeners.push(
      callback
    );

  }

  notify() {

    this.listeners.forEach(
      (
        callback
      ) => {

        callback(
          this.online
        );

      }
    );

  }

  isOnline() {

    return this.online;

  }

}

const networkRuntime =
  new NetworkRuntime();

export default
  networkRuntime;