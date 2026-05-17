export function monitorSocketHealth({
  socket,
}) {

  socket.on(
    "disconnect",
    () => {

      console.warn(
        "Socket disconnected"
      );

    }
  );

  socket.on(
    "reconnect",
    () => {

      console.log(
        "Socket reconnected"
      );

    }
  );

}