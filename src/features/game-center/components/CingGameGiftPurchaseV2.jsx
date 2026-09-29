import {
  useEffect,
  useRef,
  useState,
} from "react";

import apiClient from
  "@/infra/api/apiClient";

import {
  useRuntimeCustomerIdentityStore,
} from
  "@/runtime/customer/runtimeCustomerIdentityStore";

import {
  normalizeGiftPhone,
  normalizeGiftMessage,
  secureGiftRequestId,
  validateGiftCatalog,
  validateGiftReceipt,
  giftIntentKey,
  validateStoredGiftIntent,
} from "./cingGameGiftPurchaseV2Authority";

/*
 * CING_GAME_GIFT_PURCHASE_UI_V1
 *
 * Shared between customer Profile and Chess.
 *
 * This component is NOT mounted while the
 * frontend Gift V2 feature flag is OFF.
 *
 * No client-supplied price, Charm award
 * or sender identity in the purchase payload.
 */

const BASE =
  "/game/economy-v2/gifts";

const money = value =>
  Number(value).toLocaleString(
    "vi-VN"
  );

const surface = {
  position: "fixed",
  inset: 0,
  zIndex: 10020,
  background:
    "rgba(8,5,4,.85)",
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "center",
};

const panel = {
  width: "100%",
  maxWidth: 500,
  maxHeight: "90dvh",
  overflowY: "auto",
  background:
    "linear-gradient(160deg,#29150d,#120d0b)",
  border:
    "1px solid rgba(255,178,98,.35)",
  borderRadius:
    "24px 24px 0 0",
  padding:
    "24px 18px 36px",
  color: "#fff5e7",
  boxSizing: "border-box",
};

const action = {
  width: "100%",
  padding: "13px 14px",
  borderRadius: 13,
  border:
    "1px solid rgba(255,176,92,.35)",
  background:
    "linear-gradient(135deg,#d4531c,#f28a38)",
  color: "white",
  fontWeight: 800,
  fontSize: 14,
};

export default function
CingGameGiftPurchaseV2({
  recipientUserId,
  recipientName,
  onClose,
}) {
  const runtimePhone =
    useRuntimeCustomerIdentityStore(
      state =>
        state.identity?.phone
    );

  const sender =
    normalizeGiftPhone(
      runtimePhone
    );

  const recipient =
    normalizeGiftPhone(
      recipientUserId
    );

  const [catalog, setCatalog] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [giftId, setGiftId] =
    useState("");

  const [funding, setFunding] =
    useState("wallet");

  const [
    senderMessage,
    setSenderMessage,
  ] = useState("");

  const [confirming, setConfirming] =
    useState(false);

  const [busy, setBusy] =
    useState(false);

  const [error, setError] =
    useState("");

  const [receipt, setReceipt] =
    useState(null);

  const [pending, setPending] =
    useState(null);

  const [
    intentUnavailable,
    setIntentUnavailable,
  ] = useState(false);

  const mountedRef =
    useRef(false);

  const epochRef =
    useRef(0);

  const loadingRef =
    useRef(0);

  const submittingRef =
    useRef(false);

  const ownerRef =
    useRef(sender);

  const recipientRef =
    useRef(recipient);

  const selected =
    catalog.find(
      gift =>
        gift.id === giftId
    );

  function current(session) {
    return Boolean(
      session &&
      mountedRef.current &&
      session.epoch ===
        epochRef.current &&
      session.sender ===
        ownerRef.current &&
      session.recipient ===
        recipientRef.current &&
      session.sender ===
        normalizeGiftPhone(
          useRuntimeCustomerIdentityStore
            .getState()
            .identity?.phone
        )
    );
  }

  function capture() {
    const session = {
      sender,
      recipient,
      epoch:
        epochRef.current,
    };

    return current(session)
      ? session
      : null;
  }

  /*
   * Persist unresolved purchase identity
   * before posting to Railway.
   *
   * An uncertain retry MUST use the
   * same request_id and same payload.
   */
  function readPending(owner) {
    const key =
      giftIntentKey(owner);

    const raw =
      globalThis.sessionStorage
        ?.getItem(key);

    if (!raw) return null;

    const validated =
      validateStoredGiftIntent(
        JSON.parse(raw),
        owner
      );

    if (!validated) {
      throw new Error(
        "GAME_GIFT_STORED_INTENT_INVALID"
      );
    }

    return validated;
  }

  function savePending(intent) {
    const key =
      giftIntentKey(
        intent.sender
      );

    globalThis.sessionStorage
      ?.setItem(
        key,
        JSON.stringify(intent)
      );

    if (
      globalThis.sessionStorage
        ?.getItem(key) !==
        JSON.stringify(intent)
    ) {
      throw new Error(
        "Không lưu được mã giao dịch. Chưa thực hiện thanh toán."
      );
    }
  }

  function clearPending(owner) {
    globalThis.sessionStorage
      ?.removeItem(
        giftIntentKey(owner)
      );
  }

  useEffect(() => {
    mountedRef.current = true;

    const unsubscribe =
      useRuntimeCustomerIdentityStore
        .subscribe(state => {
          const nextOwner =
            normalizeGiftPhone(
              state.identity?.phone
            );

          if (
            nextOwner !==
            ownerRef.current
          ) {
            ownerRef.current =
              nextOwner;

            epochRef.current += 1;
            loadingRef.current += 1;
            submittingRef.current =
              false;

            setCatalog([]);
            setPending(null);
            setIntentUnavailable(false);
            setReceipt(null);
            setConfirming(false);
            setGiftId("");
            setSenderMessage("");
            setError("");
            setBusy(false);
          }
        });

    return () => {
      mountedRef.current =
        false;

      epochRef.current += 1;
      loadingRef.current += 1;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    recipientRef.current =
      recipient;

    ownerRef.current =
      sender;

    epochRef.current += 1;
    loadingRef.current += 1;
    submittingRef.current = false;

    setCatalog([]);
    setGiftId("");
    setSenderMessage("");
    setReceipt(null);
    setConfirming(false);
    setPending(null);
    setIntentUnavailable(false);
    setError("");
    setLoading(true);

    const session = {
      sender,
      recipient,
      epoch:
        epochRef.current,
    };

    if (
      !sender ||
      !recipient ||
      sender === recipient
    ) {
      setLoading(false);

      setError(
        "Không xác định được người gửi hoặc người nhận hợp lệ."
      );

      return;
    }

    try {
      const unresolved =
        readPending(sender);

      if (unresolved) {
        setPending(unresolved);

        if (
          unresolved.recipient ===
          recipient
        ) {
          setGiftId(
            unresolved.giftId
          );

          setFunding(
            unresolved.funding
          );

          setSenderMessage(
            unresolved.senderMessage ||
              ""
          );
        } else {
          setError(
            "Bạn còn một giao dịch Gift chưa xác định kết quả với người nhận khác. Vui lòng quay lại giao dịch đó trước khi tặng quà mới."
          );
        }
      }
    } catch {
      setIntentUnavailable(true);

      setError(
        "Không xác minh được giao dịch Gift đang lưu. Chưa thể tạo hoặc thử lại thanh toán."
      );
    }

    const request =
      ++loadingRef.current;

    apiClient.get(
      `${BASE}/catalog`
    ).then(response => {
      if (
        !current(session) ||
        request !==
          loadingRef.current
      ) {
        return;
      }

      if (
        response.data?.success !==
        true
      ) {
        throw new Error(
          "CATALOG_UNAVAILABLE"
        );
      }

      setCatalog(
        validateGiftCatalog(
          response.data.data
        )
      );
    }).catch(() => {
      if (
        current(session) &&
        request ===
          loadingRef.current
      ) {
        setError(
          "Chưa tải được danh mục Gift. Vui lòng thử lại sau."
        );
      }
    }).finally(() => {
      if (
        current(session) &&
        request ===
          loadingRef.current
      ) {
        setLoading(false);
      }
    });

    return () => {
      loadingRef.current += 1;
      epochRef.current += 1;
    };
  }, [
    sender,
    recipient,
  ]);

  async function purchase() {
    if (
      submittingRef.current
    ) {
      return;
    }

    const session =
      capture();

    if (
      !session ||
      !selected ||
      loading ||
      busy ||
      intentUnavailable ||
      sender === recipient
    ) {
      return;
    }

    if (
      pending &&
      (
        pending.sender !==
          sender ||
        pending.recipient !==
          recipient ||
        pending.giftId !==
          selected.id ||
        pending.funding !==
          funding ||
        pending.senderMessage !==
          normalizeGiftMessage(
            senderMessage
          )
      )
    ) {
      setError(
        "Giao dịch cũ chưa xác định kết quả. Không được tạo giao dịch Gift mới."
      );
      return;
    }

    submittingRef.current =
      true;

    setBusy(true);
    setError("");

    let intent = pending;

    try {
      if (!intent) {
        intent = {
          sender,
          recipient,
          giftId:
            selected.id,
          funding,
          senderMessage:
            normalizeGiftMessage(
              senderMessage
            ),
          requestId:
            secureGiftRequestId(),
        };

        savePending(intent);

        if (!current(session)) {
          return;
        }

        setPending(intent);
      }

      const response =
        await apiClient.post(
          `${BASE}/${intent.funding}`,
          {
            recipient_user_id:
              intent.recipient,
            gift_id:
              intent.giftId,
            request_id:
              intent.requestId,
            sender_message:
              intent.senderMessage,
          }
        );

      if (!current(session)) {
        return;
      }

      if (
        response.data?.success !==
        true
      ) {
        throw new Error(
          "GIFT_PURCHASE_UNCONFIRMED"
        );
      }

      const confirmed =
        validateGiftReceipt(
          response.data.data,
          intent
        );

      if (!current(session)) {
        return;
      }

      setReceipt(confirmed);
      setConfirming(false);

      /*
       * Only a verified backend receipt
       * allows the pending id to be cleared.
       */
      clearPending(sender);
      setPending(null);
    } catch {
      if (current(session)) {
        setError(
          "Chưa xác định được kết quả thanh toán. Nếu thử lại, hệ thống sẽ sử dụng đúng mã giao dịch cũ để tránh trừ tiền hoặc điểm lần hai."
        );
      }
    } finally {
      if (current(session)) {
        submittingRef.current =
          false;

        setBusy(false);
      }
    }
  }

  const blocked =
    Boolean(
      intentUnavailable ||
      (
        pending &&
        pending.recipient !==
          recipient
      )
    );

  return (
    <div style={surface}>
      <section
        style={panel}
        role="dialog"
        aria-modal="true"
        aria-label="Tặng vật phẩm Cing"
      >
        <p
          style={{
            color: "#f6b775",
            fontSize: 12,
            letterSpacing: 2,
            margin: "0 0 6px",
          }}
        >
          CING GAME CENTER
        </p>

        <h2
          style={{
            margin: "0 0 6px",
            fontSize: 22,
          }}
        >
          🎁 Tặng vật phẩm
        </h2>

        <p
          style={{
            color: "#c7ac98",
            fontSize: 13,
            margin: "0 0 18px",
          }}
        >
          Cho {
            recipientName ||
            "Cing iu"
          }
        </p>

        {!receipt && (
          <div
            style={{
              margin:
                "0 0 16px",
            }}
          >
            <label
              htmlFor="cing-gift-message"
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 800,
                color: "#ffd69b",
                marginBottom: 7,
              }}
            >
              Lời nhắn cho người nhận
            </label>

            <textarea
              id="cing-gift-message"
              value={senderMessage}
              disabled={
                busy ||
                Boolean(pending)
              }
              maxLength={200}
              rows={3}
              placeholder="Ví dụ: Chúc Cing iu một ngày thật vui ✨"
              onChange={event => {
                setSenderMessage(
                  event.target.value
                );
                setConfirming(false);
              }}
              style={{
                width: "100%",
                resize: "vertical",
                minHeight: 76,
                borderRadius: 13,
                border:
                  "1px solid rgba(255,176,92,.35)",
                background:
                  "rgba(255,255,255,.055)",
                color: "#fff5e7",
                padding: "11px 12px",
                fontSize: 14,
                lineHeight: 1.45,
                boxSizing: "border-box",
                outline: "none",
              }}
            />

            <div
              style={{
                marginTop: 5,
                textAlign: "right",
                color: "#9e8777",
                fontSize: 11,
              }}
            >
              {
                Array.from(
                  senderMessage
                ).length
              }/200 ký tự
            </div>

            {pending && (
              <p
                style={{
                  margin:
                    "6px 0 0",
                  color: "#c7ac98",
                  fontSize: 11,
                }}
              >
                Lời nhắn đã được khóa theo mã giao dịch đang chờ xác minh.
              </p>
            )}
          </div>
        )}

        {error && (
          <p
            role="alert"
            style={{
              color: "#ffb2a3",
              background:
                "rgba(204,55,34,.14)",
              padding: 12,
              borderRadius: 12,
              fontSize: 13,
            }}
          >
            {error}
          </p>
        )}

        {receipt ? (
          <div>
            <p
              style={{
                fontSize: 34,
                textAlign: "center",
              }}
            >
              🎉
            </p>

            <h3
              style={{
                textAlign: "center",
                color: "#ffd69b",
              }}
            >
              Đã tặng Gift thành công!
            </h3>

            <p>
              {
                receipt.gift_icon
              }{" "}
              {
                receipt.gift_name
              }
            </p>

            <p>
              +{
                receipt.charm_awarded
              }{" "}
              Điểm quyến rũ cho người nhận
            </p>

            {receipt.sender_message && (
              <p
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  background:
                    "rgba(255,255,255,.055)",
                  color: "#ffe4bf",
                }}
              >
                💌 {receipt.sender_message}
              </p>
            )}

            <p>
              Giá: {
                money(
                  receipt.price_vnd
                )
              }đ
            </p>

            <p
              style={{
                fontSize: 11,
                overflowWrap:
                  "anywhere",
                color: "#c7ac98",
              }}
            >
              Mã giao dịch: {
                receipt.request_id
              }
            </p>

            <button
              type="button"
              style={action}
              onClick={onClose}
            >
              Hoàn tất
            </button>
          </div>
        ) : (
          <>
            {loading ? (
              <p>
                Đang tải danh mục Gift…
              </p>
            ) : catalog.length ===
              0 ? (
              <p>
                Chưa có vật phẩm
                được mở bán.
              </p>
            ) : (
              <>
                {catalog.map(
                  gift => (
                    <button
                      key={
                        gift.id
                      }
                      type="button"
                      disabled={
                        busy ||
                        blocked ||
                        intentUnavailable ||
                        Boolean(
                          pending &&
                          pending.giftId !==
                            gift.id
                        )
                      }
                      onClick={() => {
                        setGiftId(
                          gift.id
                        );
                        setConfirming(
                          false
                        );
                      }}
                      style={{
                        ...action,
                        textAlign:
                          "left",
                        marginBottom: 8,
                        background:
                          giftId ===
                          gift.id
                            ? "linear-gradient(135deg,#b94a15,#e78332)"
                            : "#352118",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 21,
                        }}
                      >
                        {
                          gift.icon
                        }
                      </span>
                      {" "}
                      {
                        gift.name
                      }

                      <span
                        style={{
                          display:
                            "block",
                          fontSize: 12,
                          marginTop: 6,
                          color:
                            "#ffd5ab",
                        }}
                      >
                        {
                          money(
                            gift.price_vnd
                          )
                        }đ · {
                          gift.points_cost
                        } điểm · +{
                          gift.charm_award
                        } Charm
                      </span>
                    </button>
                  )
                )}

                {selected && (
                  <>
                    <p
                      style={{
                        fontWeight: 800,
                        marginBottom: 8,
                      }}
                    >
                      Thanh toán bằng
                    </p>

                    <div
                      style={{
                        display:
                          "grid",
                        gridTemplateColumns:
                          "1fr 1fr",
                        gap: 8,
                      }}
                    >
                      {[
                        [
                          "wallet",
                          "Cing Wallet",
                        ],
                        [
                          "points",
                          "Điểm tích lũy",
                        ],
                      ].map(
                        ([
                          value,
                          label,
                        ]) => (
                          <button
                            key={
                              value
                            }
                            type="button"
                            disabled={
                              busy ||
                              blocked ||
                              intentUnavailable ||
                              Boolean(
                                pending &&
                                pending.funding !==
                                  value
                              )
                            }
                            onClick={() => {
                              setFunding(
                                value
                              );
                              setConfirming(
                                false
                              );
                            }}
                            style={{
                              ...action,
                              background:
                                funding ===
                                value
                                  ? "#d4531c"
                                  : "#352118",
                            }}
                          >
                            {
                              label
                            }
                          </button>
                        )
                      )}
                    </div>

                    {confirming ? (
                      <div
                        style={{
                          marginTop: 18,
                          padding: 12,
                          background:
                            "#24160f",
                          borderRadius: 14,
                          border:
                            "1px solid #88552e",
                        }}
                      >
                        <p>
                          Xác nhận tặng{" "}
                          <b>
                            {
                              selected.name
                            }
                          </b>
                          {" "}cho{" "}
                          <b>
                            {
                              recipientName ||
                              "Cing iu"
                            }
                          </b>
                          ?
                        </p>

                        <p>
                          {funding ===
                          "wallet"
                            ? `${
                                money(
                                  selected.price_vnd
                                )
                              }đ từ Cing Wallet`
                            : `${
                                selected.points_cost
                              } điểm tích lũy`}
                        </p>

                        <button
                          type="button"
                          style={action}
                          disabled={
                            busy ||
                            blocked ||
                            intentUnavailable
                          }
                          onClick={
                            purchase
                          }
                        >
                          {busy
                            ? "Đang xác minh giao dịch…"
                            : pending
                              ? "Thử lại đúng giao dịch"
                              : "Xác nhận tặng Gift"}
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        style={{
                          ...action,
                          marginTop: 18,
                        }}
                        disabled={
                          busy ||
                          blocked
                        }
                        onClick={() =>
                          setConfirming(
                            true
                          )
                        }
                      >
                        Tiếp tục
                      </button>
                    )}
                  </>
                )}
              </>
            )}

            <button
              type="button"
              disabled={
                busy
              }
              onClick={
                onClose
              }
              style={{
                ...action,
                marginTop: 12,
                background:
                  "transparent",
                color: "#d8bba3",
              }}
            >
              Đóng
            </button>
          </>
        )}
      </section>
    </div>
  );
}
