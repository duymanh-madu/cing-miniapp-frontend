import { create } from "zustand";

const STORAGE_KEY = "cing_notifs_v1";
const TTL = 3 * 24 * 60 * 60 * 1000; // 3 ngày

const API_BASE = (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL) || "https://cing-backend-production.up.railway.app/api";

async function loadFromStorage() {
  try {
    const zmp = await import("zmp-sdk");
    const res = await zmp.getStorage({ keys: [STORAGE_KEY] });
    const raw = res?.data?.[STORAGE_KEY];
    if (!raw) return { notifications: [], unread: 0 };
    const { notifications } = JSON.parse(raw);
    const cutoff = Date.now() - TTL;
    const valid = (notifications || []).filter(n => new Date(n.created_at || 0).getTime() > cutoff);
    return { notifications: valid, unread: valid.filter(n => !n.read).length };
  } catch(e) {
    return { notifications: [], unread: 0 };
  }
}

// Sync notifications từ DB — bắt thông báo khi offline
async function loadFromDB(userId) {
  try {
    if (!userId) return [];
    const phone = userId.replace(/\D/g,"").replace(/^84/,"0");
    if (!phone || phone.length < 9) return [];
    const r = await fetch(`${API_BASE}/profile-update/notifications/${phone}`);
    if (!r.ok) return [];
    const json = await r.json();
    return (json.data || []).map(n => ({
      ...n,
      read: false, // chưa đọc từ DB
    }));
  } catch(e) {
    return [];
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

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unread: 0,
  loaded: false,

  load: async (userId) => {
    // Load từ local storage trước — nhanh
    const { notifications: local } = await loadFromStorage();

    // Sync từ DB — bắt notifs nhận khi offline
    const dbNotifs = await loadFromDB(userId);

    // Merge: DB notifs + local, dedup theo id
    const localIds = new Set(local.map(n => n.id).filter(Boolean));
    const newFromDB = dbNotifs.filter(n => !localIds.has(n.id));
    const merged = [...newFromDB, ...local].slice(0, 50);
    const unread = merged.filter(n => !n.read).length;

    set({ notifications: merged, unread, loaded: true });

    // Lưu merged vào storage
    if (newFromDB.length > 0) saveToStorage(merged);

    // Mark DB notifs as read sau 5s
    if (newFromDB.length > 0 && userId) {
      setTimeout(async () => {
        try {
          const phone = userId.replace(/\D/g,"").replace(/^84/,"0");
          await fetch(`${API_BASE}/profile-update/notifications/mark-read`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: phone, ids: newFromDB.map(n => n.id) }),
          });
        } catch(e) {}
      }, 5000);
    }
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

  clearAll: () => {
    set({ notifications: [], unread: 0 });
    saveToStorage([]);
  },
}));

export default useNotificationStore;
