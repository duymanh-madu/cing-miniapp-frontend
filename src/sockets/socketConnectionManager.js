import socketClient from "@/sockets/socketClient";

/**
 * =========================================================
 * SOCKET CONNECTION MANAGER
 * =========================================================
 */

class SocketConnectionManager {
  listeners = new Map();

  connected = false;

  connect() {
    if (this.connected) {
      return;
    }

    socketClient.connect();

    socketClient.on(
      "message",
      this.emitMessage
    );

    this.connected = true;
  }

  disconnect() {
    socketClient.off(
      "message",
      this.emitMessage
    );

    socketClient.disconnect();

    this.connected = false;
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(
        event,
        new Set()
      );
    }

    this.listeners
      .get(event)
      .add(callback);
  }

  off(event, callback) {
    this.listeners
      .get(event)
      ?.delete(callback);
  }

  emit(event, payload) {
    const callbacks =
      this.listeners.get(event);

    if (!callbacks) {
      return;
    }

    callbacks.forEach((callback) => {
      callback(payload);
    });
  }

  emitMessage = (payload) => {
    this.emit("message", payload);
  };
}

const socketConnectionManager =
  new SocketConnectionManager();

export default socketConnectionManager;