import socketManager from "@/services/socket/socketManager";

class SocketRoomRuntime {

  join(
    room
  ) {

    const socket =
  socketManager.connect();

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
      socketManager
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