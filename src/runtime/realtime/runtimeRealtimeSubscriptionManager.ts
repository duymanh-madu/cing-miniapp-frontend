import { runtimeLogger } from "@/runtime/logger/runtimeLogger";
import { getRuntimeSocket } from "@/runtime/socket/runtimeSocketClient";
import { realtimeEventHandlers } from "./runtimeRealtimeEventHandlers";

export function initializeRealtimeSubscriptions() {
  let attempts = 0;

  const attach = () => {
    const socket = getRuntimeSocket();
    if (!socket) {
      if (attempts++ < 30) setTimeout(attach, 1000);
      return;
    }

    // Subscribe tất cả events có handler
    Object.entries(realtimeEventHandlers).forEach(([event, handler]) => {
      socket.off(event); // tránh duplicate
      socket.on(event, (payload: any) => {
        runtimeLogger.info("RUNTIME", `[REALTIME] Event: ${event}`, payload);
        handler(payload);
      });
    });

    // Events không có trong handler nhưng cần lắng nghe
    socket.on("notification.broadcast", (payload: any) => {
      runtimeLogger.info("RUNTIME", "[REALTIME] notification.broadcast", payload);
      const handlers = realtimeEventHandlers as any;
      if (handlers["notification.broadcast"]) {
        handlers["notification.broadcast"](payload);
      }
    });

    runtimeLogger.info("RUNTIME", "[REALTIME] Subscriptions ready", {
      events: Object.keys(realtimeEventHandlers),
    });
  };

  // Đợi socket connect
  const socket = getRuntimeSocket();
  if (socket?.connected) {
    attach();
  } else {
    setTimeout(attach, 500);
  }
}
