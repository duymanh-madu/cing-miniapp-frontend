import socket
  from "./socket";

let initialized =
  false;

function initializeSocket() {

  if (
    initialized
  ) {

    return;

  }

  initialized =
    true;

  socket.connect();

}

function destroySocket() {

  if (
    !initialized
  ) {

    return;

  }

  initialized =
    false;

  socket.disconnect();

}

export {

  initializeSocket,

  destroySocket,

};