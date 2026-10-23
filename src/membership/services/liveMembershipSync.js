import apiClient from "@/infra/api/apiClient";
import { getCanonicalAccessToken } from "@/infra/auth/persistedAuthSession";
import { useRuntimeCustomerIdentityStore } from "@/runtime/customer/runtimeCustomerIdentityStore";
import useAuthStore from "@/stores/auth/authStore";
import { useMembershipStore } from "../store/membershipStore";
import { getRuntimeSocket } from "@/runtime/socket/runtimeSocketClient";
import queryClient from "@/services/query/queryClient";
import { createLiveBalanceCoordinator } from "./liveBalanceCoordinator";
const phoneOf = value => String(value || "").replace(/\D/g, "").replace(/^84/, "0");
let startCount = 0;
export function startLiveMembershipSync() {
  if (startCount++) return () => {};
  let socket = null, owner = "", token = "", timer = null;
  const currentOwner = () => {
    if (!getCanonicalAccessToken()) return "";
    const identity = useRuntimeCustomerIdentityStore.getState().identity;
    const profile = useAuthStore.getState().profile;
    const phone = phoneOf(identity?.phone || profile?.phone || profile?.phoneNumber);
    return /^0[0-9]{9}$/.test(phone) ? phone : "";
  };
  const coordinator = createLiveBalanceCoordinator({
    currentOwner,
    read: async (_owner, {signal}) => {
      const response = await apiClient.get("/membership/balance/current", {
        signal,
        headers: {Authorization: `Bearer ${getCanonicalAccessToken()}`},
      });
      if (response.data?.success !== true) throw new Error("BALANCE_NOT_CONFIRMED");
      return response.data.data;
    },
    apply: (data, phone) => {
      if (phoneOf(data?.phone) !== phone || !Number.isSafeInteger(data.points) || data.points < 0) return;
      useMembershipStore.getState().setLoyaltyPoints(data.points, phone);
      const identity = useRuntimeCustomerIdentityStore.getState().identity;
      if (phoneOf(identity?.phone) === phone && identity.loyaltyPoints !== data.points) {
        useRuntimeCustomerIdentityStore.getState().setIdentity({loyaltyPoints: data.points});
      }
      for (const [key, value] of queryClient.getQueriesData({queryKey:["membership"]})) {
        if (phoneOf(key[1]) === phone && value && value.points !== data.points) {
          queryClient.setQueryData(key, {...value, points:data.points});
        }
      }
    },
  });
  const refresh = () => {
    if (document.visibilityState === "hidden") return;
    clearTimeout(timer);
    timer = setTimeout(() => { void coordinator.invalidate(); }, 120);
  };
  const onPointsEvent = payload => {
    const phone = phoneOf(payload?.phone || payload?.user_id || payload?.userId);
    if (phone && phone === currentOwner()) refresh();
  };
  // Mutation completion also fences pending reads immediately; socket arrival
  // is an invalidation hint, not an ordered financial balance ledger.
  const onMutation = () => { void coordinator.invalidate(); };
  const check = () => {
    const nextOwner = currentOwner(), nextToken = getCanonicalAccessToken() || "";
    if (nextOwner !== owner || nextToken !== token) {
      owner = nextOwner; token = nextToken;
      useMembershipStore.getState().setLoyaltyPoints(0, "");
      void coordinator.invalidate();
    }
    const nextSocket = getRuntimeSocket();
    if (nextSocket !== socket) {
      detach(); socket = nextSocket;
      socket?.on("connect", refresh);
      for (const event of ["membership.points", "membership.updated", "user.updated", "loyalty.updated"]) socket?.on(event, onPointsEvent);
      refresh();
    }
  };
  function detach() {
    socket?.off("connect", refresh);
    for (const event of ["membership.points", "membership.updated", "user.updated", "loyalty.updated"]) socket?.off(event, onPointsEvent);
  }
  const unsubscribeIdentity = useRuntimeCustomerIdentityStore.subscribe(check);
  const unsubscribeAuth = useAuthStore.subscribe(check);
  const health = setInterval(check, 1000);
  const fallback = setInterval(refresh, 15000);
  window.addEventListener("cing:mutation-committed", onMutation);
  window.addEventListener("cing:membership-invalidated", refresh);
  window.addEventListener("online", refresh);
  window.addEventListener("focus", refresh);
  document.addEventListener("visibilitychange", refresh);
  check(); refresh();
  return () => {
    startCount = 0; coordinator.stop(); detach(); unsubscribeIdentity(); unsubscribeAuth();
    clearTimeout(timer); clearInterval(health); clearInterval(fallback);
    window.removeEventListener("cing:mutation-committed", onMutation);
    window.removeEventListener("cing:membership-invalidated", refresh);
    window.removeEventListener("online", refresh); window.removeEventListener("focus", refresh);
    document.removeEventListener("visibilitychange", refresh);
  };
}
