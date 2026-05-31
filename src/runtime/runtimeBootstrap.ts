import { initializeRuntimeSocket }           from "./socket/runtimeSocketClient";
import { initializeRealtimeOrchestrator }    from "./realtime/runtimeRealtimeOrchestrator";
import { initializeRuntimeStores }           from "../core/store/runtimeStoreOrchestrator";
import { initializeRuntimeSession }          from "./session/runtimeSessionOrchestrator";
import { initializeCustomerIdentityRuntime } from "./customer/runtimeCustomerIdentityOrchestrator";
import { useRuntimeCustomerIdentityStore }   from "./customer/runtimeCustomerIdentityStore";

/**
 * Đọc params từ URL do cing-zalo-shell inject:
 * ?zalo_id=...&zalo_name=...&zalo_avatar=...&phone=...&source=zalo-miniapp
 * Inject vào identity store trước khi chạy SDK flow
 */
function hydrateIdentityFromUrlParams() {
  try {
    const params   = new URLSearchParams(window.location.search);
    const zaloId   = params.get("zalo_id")    || "";
    const name     = params.get("zalo_name")  ? decodeURIComponent(params.get("zalo_name")!) : "";
    const avatar   = params.get("zalo_avatar") ? decodeURIComponent(params.get("zalo_avatar")!) : "";
    const phone    = params.get("phone") || "";
    const phoneToken = params.get("phone_token") || "";
    const miniAccessToken = params.get("mini_access_token") || "";
    const birthday = params.get("birthday") || "";
    const safeTop = params.get("safe_top") || "0";
    // Set CSS variable cho safe area
    try {
      const topPx = parseInt(safeTop) || 0;
      if (topPx > 0) {
        document.documentElement.style.setProperty("--app-safe-top", topPx + "px");
      }
    } catch(e) {}
    const oaFollowed = params.get("oa_followed") === "1";
    const source   = params.get("source")     || "";

    if (source !== "zalo-miniapp" || !zaloId) return;
    try { sessionStorage.setItem("zalo_source", "zalo-miniapp"); } catch(e) {}

    console.log("[RUNTIME] Shell params:", { zaloId, name, phone });

    const store = useRuntimeCustomerIdentityStore.getState();
    store.setIdentity({
      zaloUserId:   zaloId,
      fullName:     name,
      avatar:       avatar,
      phone:        phone,
      phoneToken:   phoneToken,
      phoneGranted: !!(phone || phoneToken),
      miniAccessToken: miniAccessToken,
      birthday: birthday,
      oaFollowed: oaFollowed,
    } as any);

    // Xóa params khỏi URL sau khi đọc — tránh lộ thông tin
    const cleanUrl = window.location.pathname + window.location.hash;
    window.history.replaceState({}, "", cleanUrl);

  } catch (e) {
    console.warn("[RUNTIME] hydrateIdentityFromUrlParams failed:", e);
  }
}

export async function bootstrapRuntime() {
  console.log("[RUNTIME] BOOTSTRAP STARTED");

  // 1. Đọc params từ shell trước tiên
  hydrateIdentityFromUrlParams();

  // 2. Restore session từ localStorage
  await initializeRuntimeSession();

  // 3. Khởi tạo stores
  await initializeRuntimeStores();

  // 4. Chạy Zalo identity engine
  await initializeCustomerIdentityRuntime();

  // 5. Socket + Realtime
  initializeRuntimeSocket();
  await initializeRealtimeOrchestrator();

  // Expose identity store cho socket client
  (window as any).__runtimeIdentityStore = useRuntimeCustomerIdentityStore;

  // Subscribe để emit user:online khi phone được resolve
  useRuntimeCustomerIdentityStore.subscribe((state: any) => {
    const phone = (state.identity?.phone || "").replace(/\D/g,"").replace(/^84/,"0");
    if (phone && phone !== "pending" && phone.length >= 9) {
      const socket = (window as any).__runtimeSocket;
      if (socket?.connected) {
        socket.emit("user:online", {
          userId: phone,
          name: state.identity?.fullName || "",
          avatar: state.identity?.avatar || "",
        });
      }
    }
  });

  // Re-emit user:online khi tab/app visible lại (tắt/bật màn hình)
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      setTimeout(() => {
        const store = (window as any).__runtimeIdentityStore;
        const socket = (window as any).__runtimeSocket;
        if (!store || !socket) return;
        const identity = store.getState().identity;
        const phone = (identity?.phone || "").replace(/\D/g,"").replace(/^84/,"0");
        if (phone && phone !== "pending" && phone.length >= 9 && socket.connected) {
          socket.emit("user:online", {
            userId: phone,
            name: identity?.fullName || "",
            avatar: identity?.avatar || "",
          });
        }
      }, 1000);
    }
  });

  // Lắng nghe reset BXH — hiện popup toàn server
  const socket = getRuntimeSocket();
  if (socket) {
    socket.on("leaderboard.weekly_reset", (data: any) => {
      (window as any).__leaderboardResetMsg = data;
      window.dispatchEvent(new CustomEvent("leaderboard_reset", { detail: data }));
    });
  }

  console.log("[RUNTIME] BOOTSTRAP COMPLETED");
}

import "@/runtime/control-plane/controlPlaneBridge";
