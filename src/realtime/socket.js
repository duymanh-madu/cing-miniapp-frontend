import {
  getRuntimeSocket,
  runtimeSocketEmit,
  runtimeSocketOn,
  runtimeSocketOff,
} from "@/runtime/socket/runtimeSocketClient";

/**
 * =====================================================
 * REALTIME SOCKET COMPATIBILITY BRIDGE
 * =====================================================
 * Legacy import path:
 *   "@/realtime/socket"
 *
 * Production ownership:
 *   "@/runtime/socket/runtimeSocketClient"
 *
 * This file must not create a new socket connection.
 * It only delegates to the governed runtime socket client.
 * =====================================================
 */

const realtimeSocket = {

  get raw() {
    return getRuntimeSocket();
  },

  on(event, handler) {
    return runtimeSocketOn(
      event,
      handler
    );
  },

  off(event, handler) {
    return runtimeSocketOff(
      event,
      handler
    );
  },

  emit(event, payload) {
    return runtimeSocketEmit(
      event,
      payload
    );
  },

};

export default realtimeSocket;
