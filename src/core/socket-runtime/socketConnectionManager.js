import {
  io,
} from "socket.io-client";

import webviewRuntime  from "@/core/webview/webviewRuntime";

class SocketConnectionManager {

  socket =
    null;

  connected =
    false;

  connect() {

    if (
      this.connected
    ) {

      return this.socket;

    }

    if (
      webviewRuntime
        .isHidden()
    ) {

      return null;

    }

    this.socket =
      io(

        import.meta.env
          .VITE_SOCKET_URL,

        {

          transports: [
            "websocket",
          ],

          autoConnect:
            true,

          reconnection:
            true,

          reconnectionAttempts:
            5,

          reconnectionDelay:
            1000,

        }

      );

    this.connected =
      true;

    return this.socket;

  }

  disconnect() {

    if (
      !this.socket
    ) {

      return;

    }

    this.socket.disconnect();

    this.connected =
      false;

  }

}

const socketConnectionManager =
  new SocketConnectionManager();

export default
  socketConnectionManager;