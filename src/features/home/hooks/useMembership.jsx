import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import apiClient from "@/infra/api/apiClient";
import useAuthStore from "@/stores/auth/authStore";
import { getRuntimeSocket } from "@/runtime/socket/runtimeSocketClient";

export function useMembership(overridePhone = "") {
  const profile = useAuthStore(s => s.profile);
  const storePhone = (profile?.phone || profile?.phoneNumber || profile?.mobile || "")
    .replace(/\D/g, "");
  const phone = (overridePhone || storePhone || "").replace(/\D/g, "");
  const queryClient = useQueryClient();
  const handlerRef = useRef(null);

  useEffect(() => {
    if (!phone) return;

    const handler = (data) => {
      console.log("[MEMBERSHIP] user.updated received:", JSON.stringify(data));
      const eventPhone = String(data?.payload?.phone || data?.phone || "").replace(/\D/g,"");
      const normalizedEvent = eventPhone.startsWith("84") ? "0" + eventPhone.slice(2) : eventPhone;
      console.log("[MEMBERSHIP] eventPhone:", eventPhone, "localPhone:", phone);
      if (normalizedEvent === phone || eventPhone === phone) {
        console.log("[MEMBERSHIP] Realtime update received for", phone);
        queryClient.invalidateQueries({ queryKey: ["membership", phone] });
      }
    };
    handlerRef.current = handler;

    // Retry attach listener cho den khi socket ready
    let attempts = 0;
    const attach = () => {
      const socket = getRuntimeSocket();
      console.log(`[MEMBERSHIP] attach attempt ${attempts} - socket:`, !!socket, "connected:", socket?.connected, "id:", socket?.id);
      if (socket && socket.connected) {
        socket.on("user.updated", handler);
        console.log("[MEMBERSHIP] Socket listener attached for user.updated - id:", socket.id);
        return true;
      }
      if (attempts++ < 30) {
        setTimeout(attach, 1000);
      }
      return false;
    };
    attach();

    return () => {
      const socket = getRuntimeSocket();
      if (socket && handlerRef.current) {
        socket.off("user.updated", handlerRef.current);
      }
    };
  }, [phone, queryClient]);

  return useQuery({
    queryKey: ["membership", phone],
    queryFn: async () => {
      if (!phone) return null;
      const res = await apiClient.get(`/membership/${phone}`);
      return res.data?.data || null;
    },
    enabled: !!phone,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });
}
