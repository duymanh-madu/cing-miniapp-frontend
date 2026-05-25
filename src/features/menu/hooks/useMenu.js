import { useQuery } from "@tanstack/react-query";
import apiClient from "@/infra/api/apiClient";

function useMenu() {
  return useQuery({
    queryKey: ["menu"],
    queryFn: async () => {
      const response = await apiClient.get("/menu");
      const items = response.data?.items || response.data?.data || response.data || [];
      return Array.isArray(items) ? items : [];
    },
    staleTime: 5 * 60 * 1000,    // 5 phut - khong re-fetch lien tuc
    gcTime: 10 * 60 * 1000,      // giu cache 10 phut
    retry: 3,                     // thu lai 3 lan neu loi
    retryDelay: 1000,
  });
}

export default useMenu;
