import { getRuntimeSocket } from "@/runtime/socket/runtimeSocketClient";

let registered = false;

function registerMenuRealtime() {
  if (registered) return () => {};
  registered = true;

  const refreshMenu = (payload) => {
    try {
      window.dispatchEvent(new CustomEvent("menu_refresh_requested", {
        detail: {
          source: "realtime",
          payload,
          at: Date.now()
        }
      }));
    } catch(e) {}
  };

  const attach = () => {
    const socket = getRuntimeSocket();

    if (!socket?.on) {
      setTimeout(attach, 1000);
      return;
    }

    socket.on("menu.updated", refreshMenu);
    socket.on("menu.created", refreshMenu);
    socket.on("menu.deleted", refreshMenu);
  };

  attach();

  return () => {
    const socket = getRuntimeSocket();
    socket?.off?.("menu.updated", refreshMenu);
    socket?.off?.("menu.created", refreshMenu);
    socket?.off?.("menu.deleted", refreshMenu);
    registered = false;
  };
}

export default registerMenuRealtime;
