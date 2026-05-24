/**
 * =========================================================
 * NETWORK STATE MANAGER
 * =========================================================
 */

class NetworkStateManager {
  listeners = new Set();

  online =
    navigator.onLine;

  constructor() {
    window.addEventListener(
      "online",
      this.handleOnline
    );

    window.addEventListener(
      "offline",
      this.handleOffline
    );
  }

  subscribe(callback) {
    this.listeners.add(callback);

    return () => {
      this.listeners.delete(
        callback
      );
    };
  }

  emit() {
    this.listeners.forEach(
      (callback) => {
        callback(this.online);
      }
    );
  }

  handleOnline = () => {
    this.online = true;

    this.emit();
  };

  handleOffline = () => {
    this.online = false;

    this.emit();
  };

  isOnline() {
    return this.online;
  }
}

const networkStateManager =
  new NetworkStateManager();

export default networkStateManager;