import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { getRuntimeSocket } from "@/runtime/socket/runtimeSocketClient";
import { useRuntimeCustomerIdentityStore } from "@/runtime/customer/runtimeCustomerIdentityStore";
import apiClient from "@/infra/api/apiClient";
import {
  isCingGameGiftNotification,
} from "@/stores/notification/cingGiftNotificationIdentity";

export default function NotificationSocketBridge() {
  const phone = useRuntimeCustomerIdentityStore(s => s.identity?.phone);
  const [popup, setPopup] = useState(null);

  /*
   * CING_NOTIFICATION_BRIDGE_ACCOUNT_FENCE_V1
   *
   * A recovery response, dynamic import or delayed
   * mark-read from account A must not enter account B.
   */
  useEffect(() => {
    if (!phone || phone === "pending") return;

    const p = phone
      .replace(/\\D/g, "")
      .replace(/^84/, "0");

    if (!/^0[0-9]{9}$/.test(p)) return;

    let active = true;
    let readTimer = null;

    const currentPhone = () => {
      const value =
        useRuntimeCustomerIdentityStore
          .getState()
          .identity?.phone;

      if (!value) return "";

      return String(value)
        .replace(/\\D/g, "")
        .replace(/^84/, "0");
    };

    const isCurrent = () =>
      active && currentPhone() === p;

    apiClient
      .get(`/profile-update/notifications/${p}`)
      .then(async res => {
        if (!isCurrent()) return;

        const notifs =
          res.data?.data || [];

        if (
          !Array.isArray(notifs) ||
          !notifs.length
        ) {
          return;
        }

        const { default: store } =
          await import(
            "@/stores/notification/notificationStore"
          );

        if (!isCurrent()) return;

        for (const n of notifs) {
          if (!isCurrent()) return;

          store.getState().addNotification({
            id: n.id,
            user_id: p,
            title: n.title,
            message: n.message,
            type: n.type,
            created_at: n.created_at,
            data: n.metadata,
          });
        }

        if (!isCurrent()) return;

        const legacyReadIds = notifs
          .filter(n => !isCingGameGiftNotification(n))
          .map(n => n.id)
          .filter(id => id != null);

        if (legacyReadIds.length > 0) {
          readTimer = setTimeout(() => {
            if (!isCurrent()) return;

            apiClient.post(
              "/profile-update/notifications/mark-read",
              {
                userId: p,
                ids: legacyReadIds,
              }
            ).catch(() => {});
          }, 3000);
        }
      })
      .catch(() => {});

    return () => {
      active = false;

      if (readTimer !== null) {
        clearTimeout(readTimer);
      }
    };
  }, [phone]);

  useEffect(() => {
    /*
     * CING_NOTIFICATION_SOCKET_LIFECYCLE_V1
     *
     * Only remove listeners owned by this Bridge.
     * Invalidate async callbacks on identity change.
     */
    let active = true;
    let attempts = 0;
    let retryTimer = null;
    let popupTimer = null;
    let binding = null;
    let sessionVersion = 0;

    const normalizePhone = value => {
      const digits = String(value || "")
        .replace(/\D/g, "");

      if (
        digits.startsWith("84") &&
        digits.length === 11
      ) {
        return "0" + digits.slice(2);
      }

      return /^0[0-9]{9}$/.test(digits)
        ? digits
        : "";
    };

    const currentPhone = () =>
      normalizePhone(
        useRuntimeCustomerIdentityStore
          .getState()
          .identity?.phone
      );

    let lastPhone = currentPhone();

    const clearPopupTimer = () => {
      if (popupTimer !== null) {
        clearTimeout(popupTimer);
        popupTimer = null;
      }
    };

    const unsubscribeIdentity =
      useRuntimeCustomerIdentityStore.subscribe(
        state => {
          const nextPhone =
            normalizePhone(state.identity?.phone);

          if (nextPhone === lastPhone) return;

          lastPhone = nextPhone;
          sessionVersion += 1;
          clearPopupTimer();

          if (active) setPopup(null);
        }
      );

    const detachOwnedListeners = () => {
      if (!binding) return;

      const {
        socket,
        handler,
        chessHandler,
        reconnectHandler,
      } = binding;

      socket.off("notification.new", handler);
      socket.off("notification.broadcast", handler);
      socket.off("notification:new", chessHandler);
      socket.off("connect", reconnectHandler);

      binding = null;
    };

    const attach = () => {
      if (!active) return;

      const socket = getRuntimeSocket();

      if (!socket?.connected) {
        if (attempts++ < 30) {
          retryTimer = setTimeout(() => {
            retryTimer = null;
            attach();
          }, 1000);
        }
        return;
      }

      if (retryTimer !== null) {
        clearTimeout(retryTimer);
        retryTimer = null;
      }

      detachOwnedListeners();

      const handler = data => {
        if (!active) return;

        const owner = currentPhone();
        const receivedSession = sessionVersion;

        const isCurrent = () =>
          active &&
          receivedSession === sessionVersion &&
          currentPhone() === owner;

        const notif =
          data?.payload?.notification ||
          data?.notification ||
          data;

        if (!notif?.title && !notif?.message) {
          return;
        }

        const target =
          data?.payload?.user_id ??
          notif?.user_id ??
          notif?.userId ??
          data?.userId ??
          notif?.metadata?.toUserId ??
          notif?.data?.toUserId;

        if (
          target != null &&
          normalizePhone(target) !== owner
        ) {
          return;
        }

        if (owner) {
          import(
            "@/stores/notification/notificationStore"
          ).then(({ default: store }) => {
            if (
              !isCurrent() ||
              store.getState().ownerPhone !== owner
            ) {
              return;
            }

            store.getState().addNotification(notif);
          }).catch(() => {});
        }

        const popupTypes = new Set([
          "payment_success",
          "after_hours_order",
          "points_added",
          "plays_added",
          "mission_completed",
          "CAMPAIGN_BROADCAST",
          "MISSION_COMPLETED",
        ]);

        const isRevivalReward =
          notif?.source_event ===
            "cing_offline_revive_daily_reward";

        const shouldPopup =
          !isRevivalReward &&
          (
            notif?.popup === true ||
            data?.payload?.popup ||
            popupTypes.has(notif?.type) ||
            popupTypes.has(notif?.template_key)
          );

        if (shouldPopup && isCurrent()) {
          clearPopupTimer();

          setPopup({
            title: notif.title || "Thông báo",
            message: notif.message || "",
            created_at:
              notif.created_at ||
              new Date().toISOString(),
          });

          popupTimer = setTimeout(() => {
            popupTimer = null;

            if (isCurrent()) {
              setPopup(null);
            }
          }, 6500);
        }
      };

      const chessHandler = data => {
        /*
         * CING_CHESS_LEGACY_GIFT_ACCOUNT_FENCE_V1
         *
         * This Chess legacy event is not
         * an Economy V2 purchase receipt.
         */
        if (!active) return;

        const recipient =
          normalizePhone(data?.userId);

        const receivedSession =
          sessionVersion;

        if (
          !recipient ||
          recipient !== currentPhone() ||
          data?.type !== "gift_received" ||
          !data?.title
        ) {
          return;
        }

        import(
          "@/stores/notification/notificationStore"
        ).then(({ default: store }) => {
          if (
            !active ||
            receivedSession !== sessionVersion ||
            recipient !== currentPhone() ||
            store.getState().ownerPhone !== recipient
          ) {
            return;
          }

          store.getState().addNotification({
            user_id: recipient,
            title: data.title,
            message: data.body,
            type: "gift_received",
            created_at: new Date().toISOString(),
          });
        }).catch(() => {});
      };

      const reconnectHandler = () => {
        if (!active) return;

        detachOwnedListeners();
        attach();
      };

      binding = {
        socket,
        handler,
        chessHandler,
        reconnectHandler,
      };

      socket.on("notification.new", handler);
      socket.on("notification.broadcast", handler);
      socket.on("notification:new", chessHandler);
      socket.on("connect", reconnectHandler);
    };

    attach();

    return () => {
      active = false;
      sessionVersion += 1;

      if (retryTimer !== null) {
        clearTimeout(retryTimer);
        retryTimer = null;
      }

      clearPopupTimer();
      detachOwnedListeners();
      unsubscribeIdentity();
    };
  }, []);
  return popup ? createPortal(
    <div
      onClick={() => setPopup(null)}
      style={{
        position: "fixed",
        left: 16,
        right: 16,
        top: "calc(env(safe-area-inset-top, 0px) + 74px)",
        zIndex: 100000,
        borderRadius: 18,
        padding: "14px 16px",
        background: "linear-gradient(135deg,#1b1208,#2a1400)",
        border: "1px solid rgba(255,215,0,0.35)",
        boxShadow: "0 14px 42px rgba(0,0,0,0.45)",
        color: "white",
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 900, marginBottom: 4, color: "#FFD700" }}>
        {popup.title}
      </div>
      <div style={{ fontSize: 13, lineHeight: 1.45, color: "rgba(255,255,255,0.82)" }}>
        {popup.message}
      </div>
    </div>,
    document.body
  ) : null;
}
