class SocketRecoveryRuntime {

  reconnecting = false;

  initialize() {

    window.addEventListener(
      "online",
      () => {

        this.reconnect();

      }
    );

  }

  reconnect() {

    if (this.reconnecting) {
      return;
    }

    this.reconnecting = true;

    setTimeout(
      () => {

        this.reconnecting = false;

      },
      1000
    );

  }

}

const socketRecoveryRuntime =
  new SocketRecoveryRuntime();

export default socketRecoveryRuntime;