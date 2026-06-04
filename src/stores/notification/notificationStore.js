import { create } from "zustand";

const STORAGE_KEY = "cing_notifs_v1";
const TTL = 3 * 24 * 60 * 60 * 1000; // 3 ngày

async function loadFromStorage() {
  try {
    const zmp = await import("zmp-sdk");
    const res = await zmp.getStorage({ keys: [STORAGE_KEY] });
    const raw = res?.data?.[STORAGE_KEY];
    if (!raw) return { notifications: [], unread: 0 };
    const { notifications, savedAt } = JSON.parse(raw);
    // Filter bỏ notifs quá 3 ngày
    const cutoff = Date.now() - TTL;
    const valid = (notifications || []).filter(n => new Date(n.created_at || 0).getTime() > cutoff);
    return { notifications: valid, unread: valid.filter(n => !n.read).length };
  } catch(e) {
    return { notifications: [], unread: 0 };
  }
}

async function saveToStorage(notifications) {
  try {
    const zmp = await import("zmp-sdk");
    await zmp.setStorage({
      data: { [STORAGE_KEY]: JSON.stringify({ notifications, savedAt: Date.now() }) }
    });
  } catch(e) {}
}

// Socket listener — chạy 1 lần khi store khởi tạo
let socketAttached = false;
function attachSocketListener(addNotification) {
  if (socketAttached) return;
  const tryAttach = (attempts = 0) => {
    const { getRuntimeSocket } = require('@/runtime/socket/runtimeSocketClient');
    const socket = getRuntimeSocket?.();
    if (socket?.connected) {
      socketAttached = true;
      const handler = (data) => {
        const notif = data?.payload?.notification || data?.notification || data;
        if (notif?.title || notif?.message) addNotification(notif);
      };
      socket.on("notification.new", handler);
      socket.on("notification.broadcast", handler);
    } else if (attempts < 30) {
      setTimeout(() => tryAttach(attempts + 1), 1000);
    }
  };
  tryAttach();
}

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unread: 0,
  loaded: false,

  load: async () => {
    const { notifications, unread } = await loadFromStorage();
    set({ notifications, unread, loaded: true });
  },

  addNotification: (notif) => {
    const notifications = [
      { ...notif, created_at: notif.created_at || new Date().toISOString(), read: false },
      ...get().notifications
    ].slice(0, 50);
    set({ notifications, unread: get().unread + 1 });
    saveToStorage(notifications);
  },

  markAllRead: () => {
    const notifications = get().notifications.map(n => ({ ...n, read: true }));
    set({ notifications, unread: 0 });
    saveToStorage(notifications);
  },

  init: () => {
    attachSocketListener(get().addNotification);
    get().load();
  },

  clearAll: () => {
    set({ notifications: [], unread: 0 });
    saveToStorage([]);
  },
}));

export default useNotificationStore;
