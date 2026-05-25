import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import apiClient from "@/infra/api/apiClient";
import useAuthStore from "@/stores/auth/authStore";

export function useMembership(overridePhone = "") {
  const profile = useAuthStore(s => s.profile);
  const storePhone = (profile?.phone || profile?.phoneNumber || profile?.mobile || "")
    .replace(/\D/g, "");
  const phone = (overridePhone || storePhone || "").replace(/\D/g, "");
  const queryClient = useQueryClient();

  // Socket.IO realtime listener - invalidate khi iPOS push event
  useEffect(() => {
    if (!phone) return;
    // Lay socket tu window (da khoi tao o bootstrap)
    const socket = window.__socket;
    if (!socket) return;

    const handler = (data) => {
      if (data?.phone?.replace(/\D/g,"") === phone) {
        console.log("[MEMBERSHIP] Realtime update received - refreshing");
        queryClient.invalidateQueries({ queryKey: ["membership", phone] });
      }
    };

    socket.on("membership:updated", handler);
    return () => socket.off("membership:updated", handler);
  }, [phone, queryClient]);

  return useQuery({
    queryKey: ["membership", phone],
    queryFn: async () => {
      if (!phone) return null;
      const res = await apiClient.get(`/membership/${phone}`);
      return res.data?.data || null;
    },
    enabled: !!phone,
    staleTime: 5 * 60 * 1000,  // 5 phut - backend cache 5p, webhook reset cache khi co change
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });
}
