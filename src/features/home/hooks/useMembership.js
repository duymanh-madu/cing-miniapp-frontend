import { useQuery } from "@tanstack/react-query";
import apiClient from "@/infra/api/apiClient";
import useAuthStore from "@/stores/auth/authStore";

export function useMembership() {
  const profile = useAuthStore(s => s.profile);
  const phone = (profile?.phone || profile?.phoneNumber || profile?.mobile || "")
    .replace(/\D/g, "");

  return useQuery({
    queryKey: ["membership", phone],
    queryFn: async () => {
      if (!phone) return null;
      const res = await apiClient.get(\`/membership/\${phone}\`);
      return res.data?.data || null;
    },
    enabled: !!phone,
    staleTime: 2 * 60 * 1000,
    retry: 2,
  });
}
