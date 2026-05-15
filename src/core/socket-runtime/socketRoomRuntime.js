import socketConnectionManager from "./socketConnectionManager";

class SocketRoomRuntime {

  join(
    room
  ) {

    const socket =
      socketConnectionManager
        .connect();

    if (
      !socket
    ) {

      return;

    }

    socket.emit(
      "room:join",
      room
    );

  }

  leave(
    room
  ) {

    const socket =
      socketConnectionManager
        .socket;

    if (
      !socket
    ) {

      return;

    }

    socket.emit(
      "room:leave",
      room
    );

  }

}

const socketRoomRuntime =
  new SocketRoomRuntime();

export default
  socketRoomRuntime;