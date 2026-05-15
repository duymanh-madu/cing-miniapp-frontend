import {
  io,
} from "socket.io-client";

class AdminRealtimeClient {

  socket = null;

  connect({
    token,
  }) {

    if (this.socket) {
      return this.socket;
    }

    this.socket = io(
      import.meta.env.VITE_SOCKET_URL,
      {
        transports: [
          "websocket",
        ],
        auth: {
          token,
        },
      }
    );

    return this.socket;

  }

  disconnect() {

    if (!this.socket) {
      return;
    }

    this.socket.disconnect();

    this.socket = null;

  }

}

const adminRealtimeClient =
  new AdminRealtimeClient();

export default adminRealtimeClient;