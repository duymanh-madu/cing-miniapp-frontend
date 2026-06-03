import { getRuntimeSocket } from "@/runtime/socket/runtimeSocketClient";
import { useRuntimeCustomerIdentityStore } from "@/runtime/customer/runtimeCustomerIdentityStore";

export function trackGameStart(gameId: string) {
  const phone = useRuntimeCustomerIdentityStore.getState().identity?.phone || "";
  const cleanPhone = phone.replace(/\D/g,"").replace(/^84/,"0");
  if (!cleanPhone || cleanPhone.length < 9) return;
  const socket = getRuntimeSocket();
  if (socket?.connected) {
    socket.emit("user:game", { userId: cleanPhone, game: gameId, action: "start" });
  }
}

export function trackGameStop(gameId: string) {
  const phone = useRuntimeCustomerIdentityStore.getState().identity?.phone || "";
  const cleanPhone = phone.replace(/\D/g,"").replace(/^84/,"0");
  if (!cleanPhone || cleanPhone.length < 9) return;
  const socket = getRuntimeSocket();
  if (socket?.connected) {
    socket.emit("user:game", { userId: cleanPhone, game: gameId, action: "stop" });
  }
}
