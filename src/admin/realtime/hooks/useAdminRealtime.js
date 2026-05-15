import {
  useEffect,
  useState,
} from "react";

import adminRealtimeClient from "@/admin/realtime/adminRealtimeClient";

function useAdminRealtime() {

  const [connected, setConnected] =
    useState(false);

  const [latency, setLatency] =
    useState(0);

  useEffect(() => {

    const socket =
      adminRealtimeClient.connect({
        token:
          localStorage.getItem(
            "admin_access_token"
          ),
      });

    socket.on(
      "connect",
      () => {
        setConnected(true);
      }
    );

    socket.on(
      "disconnect",
      () => {
        setConnected(false);
      }
    );

    socket.on(
      "latency:update",
      (payload) => {
        setLatency(payload.latency);
      }
    );

    return () => {
      socket.off();
    };

  }, []);

  return {
    connected,
    latency,
  };

}

export default useAdminRealtime;