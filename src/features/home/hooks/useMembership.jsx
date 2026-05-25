import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import apiClient from "@/infra/api/apiClient";
import useAuthStore from "@/stores/auth/authStore";
import { runtimeSocketOn, runtimeSocketOff } from "@/runtime/socket/runtimeSocketClient";

export function useMembership(overridePhone = "") {
  const profile = useAuthStore(s => s.profile);
  const storePhone = (profile?.phone || profile?.phoneNumber || profile?.mobile || "")
    .replace(/\D/g, "");
  const phone = (overridePhone || storePhone || "").replace(/\D/g, "");
  const queryClient = useQueryClient();

  // Socket.IO realtime - lang nghe membership:updated tu backend
  useEffect(() => {
    if (!phone) return;

    const handler = (data) => {
      const eventPhone = String(data?.phone || data?.payload?.phone || "").replace(/\D/g,"");
      if (eventPhone === phone || eventPhone === "0" + phone.slice(2)) {
        console.log("[MEMBERSHIP] Realtime update - invalidating query for", phone);
        queryClient.invalidateQueries({ queryKey: ["membership", phone] });
      }
    };

    runtimeSocketOn("user.updated", handler);
    
    return () => runtimeSocketOff("user.updated", handler);
    
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
