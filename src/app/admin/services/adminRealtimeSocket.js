import io from "socket.io-client";

import appConfig from "../../../config/appConfig";

class AdminRealtimeSocket {

  socket = null;

  connect() {

    if (
      this.socket
    ) {

      return;

    }

    this.socket =
      io(
        appConfig.socketUrl,
        {
          transports: [
            "websocket",
          ],
        }
      );

  }

  on(
    event,
    callback
  ) {

    this.socket?.on(
      event,
      callback
    );

  }

  emit(
    event,
    payload
  ) {

    this.socket?.emit(
      event,
      payload
    );

  }

}

const adminRealtimeSocket =
  new AdminRealtimeSocket();

export default
  adminRealtimeSocket;