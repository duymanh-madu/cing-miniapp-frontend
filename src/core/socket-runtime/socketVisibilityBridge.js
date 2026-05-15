import visibilityRuntime from "@/core/visibility/visibilityRuntime";

import socketConnectionManager from "./socketConnectionManager";

class SocketVisibilityBridge {

  initialize() {

    visibilityRuntime.subscribe(
      (
        visible
      ) => {

        if (
          visible
        ) {

          socketConnectionManager
            .connect();

        } else {

          socketConnectionManager
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