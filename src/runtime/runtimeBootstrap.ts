import { initializeRuntimeSocket, getRuntimeSocket } from "./socket/runtimeSocketClient";
import { initializeRealtimeOrchestrator }    from "./realtime/runtimeRealtimeOrchestrator";
import { initializeRuntimeStores }           from "../core/store/runtimeStoreOrchestrator";
import { initializeRuntimeSession }          from "./session/runtimeSessionOrchestrator";
import { useRuntimeCustomerIdentityStore }   from "./customer/runtimeCustomerIdentityStore";
import registerMenuRealtime from "@/features/menu/realtime/registerMenuRealtime";

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

async function requestShellBootData(): Promise<any> {
  return new Promise((resolve) => {
    // Chờ SHELL_READY trước, sau đó mới request — giống flow follow OA
    const totalTimer = setTimeout(() => {
      window.removeEventListener("message", handler);
      resolve(null);
    }, 8000);

    function handler(e: MessageEvent) {
      const data = e.data;
      if (!data) return;

      if (data.type === "SHELL_READY") {
        // Shell sẵn sàng → request boot data
        window.parent.postMessage({ type: "REQUEST_SHELL_BOOT_DATA" }, "*");
        return;
      }

      if (data.type === "SHELL_BOOT_DATA") {
        clearTimeout(totalTimer);
        window.removeEventListener("message", handler);
        resolve(data);
      }
    }

    window.addEventListener("message", handler);

    // Cũng gửi request ngay — phòng trường hợp SHELL_READY đã qua rồi
    window.parent.postMessage({ type: "REQUEST_SHELL_BOOT_DATA" }, "*");
  });
}

export async function bootstrapRuntime() {

  // 1. Request boot data từ shell (zalo_id, phone_token, mini_access_token)
  const shellBootData = await requestShellBootData();
  if (shellBootData?.zaloId) {
    try {
      const store = useRuntimeCustomerIdentityStore.getState();
      store.setIdentity({
        zaloUserId: shellBootData.zaloId,
        fullName: shellBootData.name || "",
        avatar: shellBootData.avatar || "",
        phoneToken: shellBootData.phoneToken || "",
        miniAccessToken: shellBootData.miniAccessToken || "",
        phoneGranted: !!shellBootData.phoneToken,
      } as any);
      console.log("[BOOT] Shell boot data applied:", shellBootData.zaloId);
    } catch(e) {}
  }

  // 1b. Fallback: đọc params từ URL
  hydrateIdentityFromUrlParams();


  // 2. Restore session từ localStorage
  await initializeRuntimeSession();

  // 3. Khởi tạo stores
  await initializeRuntimeStores();

  // 3b. Restore activated member identity from persisted auth/session.
  // Do not call Zalo phone permission again if we already have a valid phone.
  try {
    const rawSession = localStorage.getItem("cing_session");
    const session = rawSession ? JSON.parse(rawSession) : null;
    const storedPhone = String(
      session?.profile?.phone ||
      localStorage.getItem("__user_phone") ||
      ""
    ).replace(/\D/g, "").replace(/^84/, "0");

    if (storedPhone && storedPhone !== "pending" && storedPhone.length >= 9) {
      const store = useRuntimeCustomerIdentityStore.getState();
      store.setIdentity({
        customerId: session?.profile?.id || storedPhone,
        fullName: session?.profile?.name || "",
        phone: storedPhone,
        avatar: session?.profile?.avatar || "",
        phoneGranted: true,
        oaFollowed: true,
        memberActivated: true,
      } as any);
      store.setPermissionState({ phoneGranted: true, oaFollowed: true });
      store.setActivationStatus("activated");
      store.setProfileHydrated(true);
    }
  } catch(e) {
    console.warn("[BOOT] restore persisted member failed:", e);
  }


  // 4. Chạy Zalo identity engine

  // 4b removed — subscriber handles identity→authStore mirror

  // 5. Socket + Realtime
  initializeRuntimeSocket();
  await initializeRealtimeOrchestrator();
  try { registerMenuRealtime(); } catch(e) { console.warn("[MENU] register realtime failed", e); }

  // Expose identity store cho socket client
  (window as any).__runtimeIdentityStore = useRuntimeCustomerIdentityStore;

  // Không mirror runtime/Zalo name/avatar vào authStore.
  // Profile name/avatar sau khi user đổi đang được lưu server-side:
  // - players.zalo_name
  // - players.avatar
  // Runtime/Zalo chỉ dùng cho activation/fallback ban đầu, không được ghi đè profile đã đổi.
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
    socket.on("leaderboard.monthly_reset", (data: any) => {
      window.dispatchEvent(new CustomEvent("leaderboard_reset", { detail: data }));
    });
    socket.on("leaderboard.yearly_reset", (data: any) => {
      window.dispatchEvent(new CustomEvent("leaderboard_reset", { detail: data }));
    });
  }

}

import "@/runtime/control-plane/controlPlaneBridge";
