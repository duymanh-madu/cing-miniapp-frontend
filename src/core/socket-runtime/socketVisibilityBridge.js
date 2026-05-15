import visibilityRuntime from "@/core/visibility/visibilityRuntime";

import socketManager from "@/services/socket/socketManager";

class SocketVisibilityBridge {

  initialize() {

    visibilityRuntime.subscribe(
      (
        visible
      ) => {

        if (
          visible
        ) {

          socketManager
            .connect();

        } else {

          socketManager
            .disconnect();

        }

      }
    );

  }

}

const socketVisibilityBridge =
  new SocketVisibilityBridge();

export default
  socketVisibilityBridge;