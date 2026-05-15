import {
  useEffect,
} from "react";

import {
  initializeSocket,
} from "@/services/socket/socketManager";

import {
  registerSocketEvents,
} from "@/services/socket/socketEvents";

/**
 * =====================================================
 * REALTIME PROVIDER
 * =====================================================
 */

function RealtimeProvider({

  children,

}) {

  useEffect(
    () => {

      initializeSocket();

      registerSocketEvents();

    },
    []
  );

  return children;

}

export default
  RealtimeProvider;