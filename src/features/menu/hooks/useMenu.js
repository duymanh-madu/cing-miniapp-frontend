import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/infra/api/apiClient";

function useMenu() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handler = () => {
      queryClient.invalidateQueries({ queryKey: ["menu"] });
      queryClient.refetchQueries({ queryKey: ["menu"] });
    };

    window.addEventListener("menu_refresh_requested", handler);

    return () => {
      window.removeEventListener("menu_refresh_requested", handler);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ["menu"],
    queryFn: async () => {
      const response = await apiClient.get("/menu");
      const items = response.data?.items || response.data?.data || response.data || [];
      return Array.isArray(items) ? items : [];
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 3,
    retryDelay: 1000,
  });
}

export default useMenu;
