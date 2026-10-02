import { useCallback, useEffect, useRef, useState } from "react";

import apiClient from "@/infra/api/apiClient";

import useNotificationStore from "@/stores/notification/notificationStore";
import { useRuntimeCustomerIdentityStore } from "@/runtime/customer/runtimeCustomerIdentityStore";

import {
  isCingGameGiftNotification,
  deduplicateGiftNotifications,
} from "@/stores/notification/cingGiftNotificationIdentity";

/*
 * CING GAME CENTER V2 — GIFT INBOX
 *
 * Presentation only.
 *
 * Backend:
 *   GET  /game/economy-v2/gifts/notifications
 *   POST /game/economy-v2/gifts/notifications/:id/read
 *
 * Both routes must be authenticated and feature gated.
 *
 * This component must not mount until the Economy V2
 * router has been mounted and release-approved.
 *
 * No Wallet, loyalty, Charm or receipt mutation.
 */

const BASE = "/game/economy-v2/gifts/notifications";

const panelStyle = {
  padding: "12px 14px",
  borderBottom: "1px solid #f0ece7",
  background: "#fffaf4",
};

function safeMetadata(notification) {
  const metadata =
    notification?.metadata ||
    notification?.data ||
    {};

  return metadata &&
    typeof metadata === "object" &&
    !Array.isArray(metadata)
      ? metadata
      : {};
}

function giftTitle(notification) {
  const metadata = safeMetadata(notification);

  return (
    metadata.giftName ||
    notification?.title ||
    "Quà tặng Cing"
  );
}

function giftSender(notification) {
  const name = safeMetadata(notification).fromName;
  return typeof name === "string" && name.trim()
    ? name.trim()
    : "";
}

function giftDetails(notification) {
  const metadata = safeMetadata(notification);

  const charm = Number(metadata.charm);

  if (
    !Number.isFinite(charm) ||
    charm < 0
  ) {
    return "Bạn vừa nhận được một món quà";
  }

  return `+${charm} điểm quyến rũ`;
}

function timeLabel(value) {
  if (!value) return "";

  const date = new Date(value);

  if (
    !Number.isFinite(date.getTime())
  ) {
    return "";
  }

  return date.toLocaleString("vi-VN");
}

export default function CingGiftInboxV2({
  phone,
}) {
  /*
   * CING_GIFT_INBOX_ACCOUNT_FENCE_V1
   *
   * Account changes invalidate both list recovery
   * and backend-confirmed read callbacks.
   *
   * The epoch also rejects A -> B -> A replays.
   */
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [readingId, setReadingId] = useState(null);

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

  const runtimePhone = () =>
    normalizePhone(
      useRuntimeCustomerIdentityStore
        .getState()
        .identity?.phone
    );

  const mountedRef = useRef(false);
  const ownerRef = useRef(runtimePhone());
  const epochRef = useRef(0);
  const listRequestRef = useRef(0);

  const resetForOwner = nextOwner => {
    if (ownerRef.current === nextOwner) {
      return;
    }

    ownerRef.current = nextOwner;
    epochRef.current += 1;
    listRequestRef.current += 1;

    if (mountedRef.current) {
      setItems([]);
      setLoading(Boolean(nextOwner));
      setError("");
      setReadingId(null);
    }
  };

  const captureSession = () => {
    const owner = runtimePhone();

    if (
      !mountedRef.current ||
      !owner ||
      normalizePhone(phone) !== owner ||
      ownerRef.current !== owner ||
      useNotificationStore
        .getState()
        .ownerPhone !== owner
    ) {
      return null;
    }

    return {
      owner,
      epoch: epochRef.current,
    };
  };

  const isCurrentSession = session =>
    Boolean(
      session &&
      mountedRef.current &&
      session.epoch === epochRef.current &&
      session.owner === ownerRef.current &&
      session.owner === runtimePhone() &&
      session.owner === normalizePhone(phone) &&
      useNotificationStore
        .getState()
        .ownerPhone === session.owner
    );

  const addNotification =
    useNotificationStore(
      state => state.addNotification
    );

  const markGiftNotificationRead =
    useNotificationStore(
      state => state.markGiftNotificationRead
    );

  useEffect(() => {
    mountedRef.current = true;

    resetForOwner(runtimePhone());

    const unsubscribe =
      useRuntimeCustomerIdentityStore.subscribe(
        state => {
          resetForOwner(
            normalizePhone(
              state.identity?.phone
            )
          );
        }
      );

    return () => {
      mountedRef.current = false;
      epochRef.current += 1;
      listRequestRef.current += 1;
      unsubscribe();
    };
  }, []);

  const load = useCallback(
    async () => {
      const session = captureSession();

      if (!session) return;

      const requestId =
        ++listRequestRef.current;

      const isCurrent = () =>
        isCurrentSession(session) &&
        requestId === listRequestRef.current;

      setLoading(true);
      setError("");

      try {
        const response =
          await apiClient.get(
            BASE
          );

        if (!isCurrent()) return;

        if (
          response.data?.success !== true ||
          !Array.isArray(response.data?.data)
        ) {
          throw new Error(
            "GIFT_INBOX_RESPONSE_INVALID"
          );
        }

        const received =
          deduplicateGiftNotifications(
            response.data.data.filter(
              isCingGameGiftNotification
            ).filter(
              gift =>
                gift.user_id == null ||
                normalizePhone(
                  gift.user_id
                ) === session.owner
            )
          );

        if (!isCurrent()) return;

        setItems(received);

        for (const gift of received) {
          if (!isCurrent()) return;

          if (
            gift.id == null ||
            gift.id === ""
          ) {
            continue;
          }

          addNotification({
            ...gift,
            user_id: session.owner,
            data: gift.metadata,
            read:
              Boolean(
                gift.is_read
              ),
          });
        }
      } catch (e) {
        if (!isCurrent()) return;

        setError(
          e?.response?.status === 401
            ? "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
            : "Chưa tải được quà tặng. Vui lòng thử lại."
        );
      } finally {
        if (isCurrent()) {
          setLoading(false);
        }
      }
    },
    [addNotification, phone]
  );

  // Refresh an open inbox when the authenticated background reader
  // discovers a new durable Gift receipt (no new financial writes).
  useEffect(() => {
    const onGiftUpdate = event => {
      if (normalizePhone(event?.detail?.owner) === runtimePhone()) {
        load();
      }
    };
    window.addEventListener("cing:gift-inbox-updated", onGiftUpdate);
    return () => window.removeEventListener("cing:gift-inbox-updated", onGiftUpdate);
  }, [load, phone]);

  useEffect(() => {
    const owner =
      normalizePhone(phone);

    if (
      !owner ||
      owner !== runtimePhone()
    ) {
      return;
    }

    resetForOwner(owner);

    load();

    return () => {
      listRequestRef.current += 1;
    };
  }, [phone, load]);

  async function readGift(gift) {
    const session = captureSession();

    if (!session) return;

    if (
      gift.is_read ||
      gift.id == null ||
      gift.id === ""
    ) {
      return;
    }

    const id = String(gift.id);

    if (!/^[1-9][0-9]*$/.test(id)) {
      if (isCurrentSession(session)) {
        setError(
          "Thông báo quà tặng chưa có mã hợp lệ."
        );
      }

      return;
    }

    if (!isCurrentSession(session)) {
      return;
    }

    setReadingId(id);
    setError("");

    try {
      const response =
        await apiClient.post(
          `${BASE}/${encodeURIComponent(id)}/read`
        );

      if (!isCurrentSession(session)) {
        return;
      }

      if (
        response.data?.success !== true ||
        response.data?.data?.is_read !== true ||
        String(response.data?.data?.id) !== id
      ) {
        throw new Error(
          "GIFT_MARK_READ_UNCONFIRMED"
        );
      }

      if (!isCurrentSession(session)) {
        return;
      }

      setItems(previous =>
        isCurrentSession(session)
          ? previous.map(item =>
              String(item.id) === id
                ? {
                    ...item,
                    is_read: true,
                  }
                : item
            )
          : previous
      );

      if (!isCurrentSession(session)) {
        return;
      }

      markGiftNotificationRead({
        id,
        purchaseId:
          safeMetadata(gift)
            .gift_purchase_id,
      });
    } catch (e) {
      if (!isCurrentSession(session)) {
        return;
      }

      setError(
        e?.response?.status === 401
          ? "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
          : "Chưa xác nhận được trạng thái đã đọc. Vui lòng thử lại."
      );
    } finally {
      if (isCurrentSession(session)) {
        setReadingId(null);
      }
    }
  }

  return (
    <section style={panelStyle}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          marginBottom: 10,
        }}
      >
        <strong
          style={{
            color: "#60300f",
            fontSize: 13,
          }}
        >
          🎁 Quà tặng Cing
        </strong>

        <button
          type="button"
          disabled={loading || readingId !== null}
          onClick={() => load()}
          style={{
            border: "1px solid #e8d0b6",
            borderRadius: 8,
            padding: "5px 9px",
            background: "#fff",
            color: "#8b4b19",
            fontSize: 11,
            cursor: "pointer",
          }}
        >
          Làm mới
        </button>
      </div>

      {loading && (
        <p
          role="status"
          style={{
            margin: "8px 0",
            fontSize: 12,
            color: "#806b58",
          }}
        >
          Đang tải quà tặng...
        </p>
      )}

      {error && (
        <p
          role="alert"
          style={{
            margin: "8px 0",
            fontSize: 12,
            color: "#b42318",
          }}
        >
          {error}
        </p>
      )}

      {!loading &&
        !error &&
        items.length === 0 && (
          <p
            style={{
              fontSize: 12,
              color: "#806b58",
              margin: "8px 0",
            }}
          >
            Chưa có quà tặng mới.
          </p>
        )}

      {!loading &&
        items.map(gift => {
          const id = String(gift.id);

          const busy =
            readingId === id;

          return (
            <button
              key={
                safeMetadata(gift)
                  .gift_purchase_id ||
                id
              }
              type="button"
              disabled={
                busy ||
                readingId !== null ||
                Boolean(gift.is_read)
              }
              onClick={() =>
                readGift(gift)
              }
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                border: "1px solid #f0e0cd",
                borderRadius: 12,
                padding: "10px 12px",
                marginBottom: 8,
                background:
                  gift.is_read
                    ? "#fff"
                    : "#fff0d9",
                color: "#39210f",
                cursor:
                  gift.is_read
                    ? "default"
                    : "pointer",
              }}
            >
              <div
                style={{
                  fontWeight: 800,
                  fontSize: 13,
                }}
              >
                {giftTitle(gift)}
              </div>
              {giftSender(gift) && (
                <div style={{ marginTop: 4, fontSize: 12, color: "#79400e" }}>
                  Người tặng: <strong>{giftSender(gift)}</strong>
                </div>
              )}

              <div
                style={{
                  marginTop: 3,
                  fontSize: 12,
                  color: "#a35c18",
                }}
              >
                {giftDetails(gift)}
              </div>

              <div
                style={{
                  marginTop: 5,
                  fontSize: 10,
                  color: "#887766",
                }}
              >
                {timeLabel(
                  gift.created_at
                )}
              </div>

              <div
                style={{
                  marginTop: 6,
                  fontSize: 11,
                  fontWeight: 700,
                  color:
                    gift.is_read
                      ? "#888"
                      : "#95501b",
                }}
              >
                {busy
                  ? "Đang xác nhận..."
                  : gift.is_read
                    ? "Đã xem"
                    : "Chạm để đánh dấu đã xem"}
              </div>
            </button>
          );
        })}
    </section>
  );
}
