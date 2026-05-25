import { useQuery } from "@tanstack/react-query";
import apiClient from "@/infra/api/apiClient";
import useAuthStore from "@/stores/auth/authStore";

// Global phone override cho dev/web testing
let _devPhone = "";
let _devPhoneListeners = [];
export function setDevPhone(phone) {
  _devPhone = phone;
  _devPhoneListeners.forEach(fn => fn(phone));
}
export function onDevPhone(fn) {
  _devPhoneListeners.push(fn);
  return () => { _devPhoneListeners = _devPhoneListeners.filter(f => f !== fn); };
}

export function useMembership() {
  const profile = useAuthStore(s => s.profile);
  const storePhone = (profile?.phone || profile?.phoneNumber || profile?.mobile || "")
    .replace(/\D/g, "");

  const phone = storePhone || _devPhone;

  return useQuery({
    queryKey: ["membership", phone],
    queryFn: async () => {
      if (!phone) return null;
      const res = await apiClient.get(`/membership/${phone}`);
      return res.data?.data || null;
    },
    enabled: !!phone,
    staleTime: 2 * 60 * 1000,
    retry: 2,
  });
}
