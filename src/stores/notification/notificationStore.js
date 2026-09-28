import { create } from "zustand";
import apiClient from "@/infra/api/apiClient";
import { useRuntimeCustomerIdentityStore } from "@/runtime/customer/runtimeCustomerIdentityStore";
import {
  isCingGameGiftNotification,
  addGiftNotificationOnce,
  deduplicateGiftNotifications,
} from "./cingGiftNotificationIdentity";

/*
 * CING_NOTIFICATION_ACCOUNT_ISOLATION_V1
 *
 * The ownerless cing_notifs_v1 cache is intentionally
 * not migrated into any authenticated account.
 */
const STORAGE_PREFIX = "cing_notifs_v2_";

function notificationOwner(value) {
  const digits = String(value || "")
    .replace(/\D/g, "");

  const phone =
    digits.startsWith("84") &&
    digits.length === 11
      ? "0" + digits.slice(2)
      : digits;

  return /^0[0-9]{9}$/.test(phone)
    ? phone
    : "";
}

function runtimeOwner() {
  return notificationOwner(
    useRuntimeCustomerIdentityStore
      .getState()
      .identity?.phone
  );
}

let ownerGeneration = 0;
const TTL = 3 * 24 * 60 * 60 * 1000; // 3 ngày

const API_BASE = (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL) || "https://cing-backend-production.up.railway.app/api";

async function loadFromStorage(owner) {
  if (!owner) {
    return {
      notifications: [],
      unread: 0,
    };
  }

  try {
    const zmp = await import("zmp-sdk");

    const key =
      STORAGE_PREFIX + owner;

    const response =
      await zmp.getStorage({
        keys: [key],
      });

    const raw =
      response?.data?.[key];

    if (!raw) {
      return {
        notifications: [],
        unread: 0,
      };
    }

    const cached =
      JSON.parse(raw);

    if (
      cached?.owner !== owner ||
      !Array.isArray(
        cached.notifications
      )
    ) {
      return {
        notifications: [],
        unread: 0,
      };
    }

    const cutoff =
      Date.now() - TTL;

    const notifications =
      cached.notifications.filter(
        n =>
          new Date(
            n.created_at || 0
          ).getTime() > cutoff
      );

    return {
      notifications,
      unread:
        notifications.filter(
          n => !n.read
        ).length,
    };
  } catch (error) {
    return {
      notifications: [],
      unread: 0,
    };
  }
}

// Sync notifications từ DB — bắt thông báo khi offline
async function loadFromDB(userId) {
  try {
    if (!userId) return [];
    const phone = userId.replace(/\D/g,"").replace(/^84/,"0");
    if (!phone || phone.length < 9) return [];
    const r = await apiClient.get(
      `/profile-update/notifications/${phone}`
    );
    const json = r.data;
    return (json.data || []).map(n => ({
      ...n,
      read: false, // chưa đọc từ DB
    }));
  } catch(e) {
    return [];
  }
}

async function saveToStorage(
  owner,
  notifications
) {
  if (
    !owner ||
    owner !== runtimeOwner()
  ) {
    return;
  }

  try {
    const zmp =
      await import("zmp-sdk");

    if (
      owner !== runtimeOwner()
    ) {
      return;
    }

    const key =
      STORAGE_PREFIX + owner;

    await zmp.setStorage({
      data: {
        [key]: JSON.stringify({
          owner,
          notifications,
          savedAt:
            Date.now(),
        }),
      },
    });
  } catch (error) {}
}

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unread: 0,
  loaded: false,

  ownerPhone: "",

  switchOwner: (userId) => {
    const owner =
      notificationOwner(
        userId
      );

    if (
      get().ownerPhone === owner
    ) {
      return;
    }

    ownerGeneration += 1;

    set({
      ownerPhone: owner,
      notifications: [],
      unread: 0,
      loaded: false,
    });
  },

  load: async (userId) => {
    const owner =
      notificationOwner(
        userId
      );

    if (
      !owner ||
      owner !== runtimeOwner()
    ) {
      return;
    }

    get().switchOwner(
      owner
    );

    const generation =
      ownerGeneration;

    const isCurrent = () =>
      generation === ownerGeneration &&
      get().ownerPhone === owner &&
      runtimeOwner() === owner;

    const {
      notifications: local,
    } =
      await loadFromStorage(
        owner
      );

    if (!isCurrent()) return;

    const dbNotifs =
      await loadFromDB(
        owner
      );

    if (!isCurrent()) return;

    const localIds =
      new Set(
        local
          .map(n => n.id)
          .filter(
            id => id != null
          )
          .map(String)
      );

    const newFromDB =
      dbNotifs.filter(
        n =>
          n.id == null ||
          !localIds.has(
            String(n.id)
          )
      );

    const merged =
      deduplicateGiftNotifications(
        [
          ...newFromDB,
          ...local,
        ]
      );

    if (!isCurrent()) return;

    const unread =
      merged.filter(
        n => !n.read
      ).length;

    set({
      notifications: merged,
      unread,
      loaded: true,
    });

    if (
      newFromDB.length > 0
    ) {
      saveToStorage(
        owner,
        merged
      );
    }

    const legacyReadIds =
      newFromDB
        .filter(n => !isCingGameGiftNotification(n))
        .map(
          n => n.id
        )
        .filter(
          id =>
            id != null
        );

    if (
      legacyReadIds.length > 0 &&
      isCurrent()
    ) {
      setTimeout(
        async () => {
          if (
            !isCurrent()
          ) {
            return;
          }

          try {
            await apiClient.post(
              "/profile-update/notifications/mark-read",
              {
                userId: owner,
                ids: legacyReadIds,
              }
            );
          } catch (error) {}
        },
        5000
      );
    }
  },

  addNotification: (notif) => {
    const owner =
      get().ownerPhone;

    if (
      !owner ||
      owner !== runtimeOwner()
    ) {
      return;
    }

    const recipient =
      notif?.user_id ??
      notif?.userId ??
      notif?.metadata?.toUserId ??
      notif?.data?.toUserId;

    if (
      recipient != null &&
      notificationOwner(
        recipient
      ) !== owner
    ) {
      return;
    }

    const incoming = {
      ...notif,
      created_at: notif.created_at || new Date().toISOString(),
      read: isCingGameGiftNotification(notif)
        ? Boolean(notif.is_read || notif.read)
        : false,
    };

    const result = addGiftNotificationOnce(
      get().notifications,
      incoming
    );

    const unread = result.notifications.filter(
      n => !n.read
    ).length;

    set({
      notifications: result.notifications,
      unread,
    });

    saveToStorage(owner, result.notifications);
  },

  /*
   * Opening the Notification Bell may retain
   * legacy read behavior, but must never
   * silently read Economy V2 Gifts.
   */
  markLegacyRead: () => {
    const notifications = get().notifications.map(
      notification =>
        isCingGameGiftNotification(notification)
          ? notification
          : {
              ...notification,
              read: true,
            }
    );

    set({
      notifications,
      unread: notifications.filter(
        notification => !notification.read
      ).length,
    });

    saveToStorage(get().ownerPhone, notifications);
  },

  /*
   * Called only after the authenticated
   * Gift mark-read API confirms success.
   */
  markGiftNotificationRead: ({
    id,
    purchaseId,
  }) => {
    const notifications = get().notifications.map(
      notification => {
        if (
          !isCingGameGiftNotification(
            notification
          )
        ) {
          return notification;
        }

        const metadata =
          notification.metadata ||
          notification.data ||
          {};

        const sameId =
          id != null &&
          notification.id != null &&
          String(notification.id) ===
            String(id);

        const samePurchase =
          purchaseId != null &&
          metadata.gift_purchase_id != null &&
          String(
            metadata.gift_purchase_id
          ) === String(purchaseId);

        return sameId || samePurchase
          ? {
              ...notification,
              read: true,
              is_read: true,
            }
          : notification;
      }
    );

    set({
      notifications,
      unread: notifications.filter(
        notification =>
          !notification.read
      ).length,
    });

    saveToStorage(get().ownerPhone, notifications);
  },

  markAllRead: () => {
    const notifications = get().notifications.map(n => ({ ...n, read: true }));
    set({ notifications, unread: 0 });
    saveToStorage(get().ownerPhone, notifications);
  },

  clearAll: () => {
    set({ notifications: [], unread: 0 });
    saveToStorage(get().ownerPhone, []);
  },
}));

/*
 * Identity is the authoritative account boundary.
 * A switch clears visible state synchronously.
 */
useRuntimeCustomerIdentityStore.subscribe(
  state => {
    useNotificationStore
      .getState()
      .switchOwner(
        state.identity?.phone
      );
  }
);

useNotificationStore
  .getState()
  .switchOwner(
    runtimeOwner()
  );

export default useNotificationStore;
