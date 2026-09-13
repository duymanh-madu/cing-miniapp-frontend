import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import QRCode
  from "qrcode";

import {
  fetchWalletPosAlerts,
  fetchWalletPosSession,
  fetchWalletPosSessions,
  recoverWalletPosQr,
  submitWalletPosAmount,
} from "./adminWalletPosApi";

import {
  getRuntimeSocket,
} from "@/runtime/socket/runtimeSocketClient";

import "./admin-wallet-pos.css";


const POLL_INTERVAL_MS =
  1500;

const ACTIVE_STATUSES =
  new Set([
    "awaiting_amount",
    "amount_frozen",
    "qr_ready",
    "paid",
    "reconciliation_pending",
    "reconciliation_mismatch",
  ]);


function formatMoney(
  value
) {
  return `${new Intl.NumberFormat(
    "vi-VN"
  ).format(
    Number(value || 0)
  )}đ`;
}


function formatTime(
  value
) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "vi-VN",
    {
      hour:
        "2-digit",
      minute:
        "2-digit",
      second:
        "2-digit",
      day:
        "2-digit",
      month:
        "2-digit",
    }
  ).format(date);
}


function parseMoneyInput(
  value
) {
  const digits =
    String(value || "")
      .replace(
        /[^\d]/g,
        ""
      );

  if (!digits) {
    return "";
  }

  return new Intl.NumberFormat(
    "vi-VN"
  ).format(
    Number(digits)
  );
}


function toIntegerAmount(
  value
) {
  const raw =
    String(value || "")
      .replace(
        /[^\d]/g,
        ""
      );

  const number =
    Number(raw);

  if (
    !Number.isSafeInteger(
      number
    ) ||
    number <= 0
  ) {
    return null;
  }

  return number;
}


function statusLabel(
  status
) {
  const map = {
    awaiting_amount:
      "Chờ nhập số tiền",

    amount_frozen:
      "Đã khóa số tiền",

    qr_ready:
      "Đang chờ khách thanh toán",

    paid:
      "Đã thanh toán",

    reconciliation_pending:
      "Đã thanh toán · Chờ đối soát",

    reconciled:
      "Đã đối soát",

    reconciliation_mismatch:
      "Lệch đối soát",

    cancelled:
      "Đã hủy",

    expired:
      "Đã hết hạn",
  };

  return map[status] ||
    status ||
    "Không xác định";
}


function statusTone(
  status
) {
  if (
    status ===
      "reconciled" ||
    status ===
      "paid"
  ) {
    return "success";
  }

  if (
    status ===
      "reconciliation_pending" ||
    status ===
      "qr_ready"
  ) {
    return "waiting";
  }

  if (
    status ===
      "reconciliation_mismatch"
  ) {
    return "danger";
  }

  return "neutral";
}


export default function
AdminWalletPosCounter({
  token,
  role,
}) {
  const [
    sessions,
    setSessions,
  ] =
    useState([]);

  const [
    selectedId,
    setSelectedId,
  ] =
    useState(null);

  const [
    selected,
    setSelected,
  ] =
    useState(null);

  const [
    alerts,
    setAlerts,
  ] =
    useState([]);

  const [
    amountInput,
    setAmountInput,
  ] =
    useState("");

  const [
    qrContent,
    setQrContent,
  ] =
    useState("");

  const [
    qrDataUrl,
    setQrDataUrl,
  ] =
    useState("");

  const [
    submitting,
    setSubmitting,
  ] =
    useState(false);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    notice,
    setNotice,
  ] =
    useState("");

  const mountedRef =
    useRef(true);

  const requestInFlightRef =
    useRef(false);


  const isSuperAdmin =
    String(
      role || ""
    ).toLowerCase() ===
    "super_admin";


  const activeSessions =
    useMemo(
      () =>
        sessions.filter(
          item =>
            ACTIVE_STATUSES.has(
              item.status
            )
        ),
      [
        sessions,
      ]
    );


  const loadData =
    useCallback(
      async ({
        silent = false,
      } = {}) => {
        if (
          requestInFlightRef.current
        ) {
          return;
        }

        requestInFlightRef.current =
          true;

        if (!silent) {
          setLoading(true);
        }

        try {
          const [
            nextSessions,
            nextAlerts,
          ] =
            await Promise.all([
              fetchWalletPosSessions(
                token,
                {
                  limit:
                    30,
                }
              ),

              isSuperAdmin
                ? fetchWalletPosAlerts(
                    token,
                    {
                      status:
                        "open",
                      limit:
                        100,
                    }
                  )
                : Promise.resolve(
                    []
                  ),
            ]);

          if (
            !mountedRef.current
          ) {
            return;
          }

          setSessions(
            nextSessions
          );

          setAlerts(
            nextAlerts
          );

          setError("");

          if (
            selectedId
          ) {
            const fresh =
              nextSessions.find(
                item =>
                  item.id ===
                  selectedId
              );

            if (fresh) {
              setSelected(
                previous => ({
                  ...previous,
                  ...fresh,
                })
              );
            }
          } else {
            const first =
              nextSessions.find(
                item =>
                  ACTIVE_STATUSES.has(
                    item.status
                  )
              ) ||
              nextSessions[0] ||
              null;

            if (first) {
              setSelectedId(
                first.id
              );

              setSelected(
                first
              );
            }
          }
        } catch (
          nextError
        ) {
          if (
            mountedRef.current
          ) {
            setError(
              nextError
                ?.response
                ?.data
                ?.message ||
              nextError
                ?.message ||
              "Không thể tải Cing Pay Counter."
            );
          }
        } finally {
          requestInFlightRef.current =
            false;

          if (
            mountedRef.current &&
            !silent
          ) {
            setLoading(false);
          }
        }
      },
      [
        isSuperAdmin,
        selectedId,
        token,
      ]
    );


  useEffect(
    () => {
      mountedRef.current =
        true;

      void loadData();

      const timer =
        window.setInterval(
          () => {
            void loadData({
              silent:
                true,
            });
          },
          POLL_INTERVAL_MS
        );

      return () => {
        mountedRef.current =
          false;

        window.clearInterval(
          timer
        );
      };
    },
    [
      loadData,
    ]
  );


  useEffect(
    () => {
      let socket =
        null;

      let retryTimer =
        null;

      let disposed =
        false;

      const events = [
        "wallet.pos.session.discovered",
        "wallet.pos.qr.ready",
        "wallet.pos.payment.paid",
        "wallet.pos.reconciliation.matched",
        "wallet.pos.reconciliation.alert",
      ];

      const handleRealtime =
        payload => {
          if (disposed) {
            return;
          }

          if (
            payload?.session_id &&
            selectedId &&
            payload.session_id ===
              selectedId
          ) {
            if (
              payload.status
            ) {
              setSelected(
                previous => ({
                  ...previous,
                  status:
                    payload.status,
                })
              );
            }
          }

          void loadData({
            silent:
              true,
          });
        };

      const attach =
        () => {
          if (disposed) {
            return;
          }

          const nextSocket =
            getRuntimeSocket();

          if (!nextSocket) {
            retryTimer =
              window.setTimeout(
                attach,
                500
              );

            return;
          }

          socket =
            nextSocket;

          events.forEach(
            event => {
              socket.on(
                event,
                handleRealtime
              );
            }
          );
        };

      attach();

      return () => {
        disposed =
          true;

        if (retryTimer) {
          window.clearTimeout(
            retryTimer
          );
        }

        if (socket) {
          events.forEach(
            event => {
              socket.off(
                event,
                handleRealtime
              );
            }
          );
        }
      };
    },
    [
      loadData,
      selectedId,
    ]
  );



  useEffect(
    () => {
      if (!selectedId) {
        return;
      }

      let cancelled =
        false;

      const load =
        async () => {
          try {
            const next =
              await fetchWalletPosSession(
                token,
                selectedId
              );

            if (
              !cancelled &&
              next
            ) {
              setSelected(
                next
              );
            }
          } catch {
            void 0;
          }
        };

      void load();

      return () => {
        cancelled =
          true;
      };
    },
    [
      selectedId,
      token,
    ]
  );


  useEffect(
    () => {
      if (
        !selected?.id ||
        selected.status !==
          "qr_ready" ||
        qrContent
      ) {
        return;
      }

      let cancelled =
        false;

      const recover =
        async () => {
          try {
            const recovered =
              await recoverWalletPosQr(
                token,
                selected.id
              );

            if (
              cancelled ||
              !recovered
                ?.qr_content
            ) {
              return;
            }

            setQrContent(
              recovered.qr_content
            );

            setSelected(
              previous => ({
                ...previous,
                amount:
                  recovered.amount,
                payment_intent_id:
                  recovered.payment_intent_id,
                status:
                  recovered.status,
              })
            );

            setNotice(
              "QR thanh toán đang hoạt động đã được khôi phục."
            );
          } catch (
            recoveryError
          ) {
            if (cancelled) {
              return;
            }

            const code =
              recoveryError
                ?.response
                ?.data
                ?.code;

            if (
              code ===
                "CING_WALLET_POS_QR_RECOVERY_EXPIRED"
            ) {
              setError(
                "QR thanh toán đã hết hạn. Không tạo lại intent cũ."
              );
            }
          }
        };

      void recover();

      return () => {
        cancelled =
          true;
      };
    },
    [
      qrContent,
      selected?.id,
      selected?.status,
      token,
    ]
  );



  useEffect(
    () => {
      let cancelled =
        false;

      async function renderQr() {
        if (!qrContent) {
          setQrDataUrl("");
          return;
        }

        try {
          const dataUrl =
            await QRCode.toDataURL(
              qrContent,
              {
                width:
                  560,
                margin:
                  2,
                errorCorrectionLevel:
                  "M",
              }
            );

          if (!cancelled) {
            setQrDataUrl(
              dataUrl
            );
          }
        } catch {
          if (!cancelled) {
            setError(
              "Không thể render QR thanh toán."
            );
          }
        }
      }

      void renderQr();

      return () => {
        cancelled =
          true;
      };
    },
    [
      qrContent,
    ]
  );


  const selectSession =
    useCallback(
      session => {
        setSelectedId(
          session.id
        );

        setSelected(
          session
        );

        setAmountInput(
          session.amount
            ? new Intl.NumberFormat(
                "vi-VN"
              ).format(
                Number(
                  session.amount
                )
              )
            : ""
        );

        setQrContent("");

        setQrDataUrl("");

        setNotice("");

        setError("");
      },
      []
    );


  const submitAmount =
    useCallback(
      async () => {
        if (
          !selected?.id ||
          submitting
        ) {
          return;
        }

        const amount =
          toIntegerAmount(
            amountInput
          );

        if (!amount) {
          setError(
            "Nhập số tiền khách cần thanh toán."
          );
          return;
        }

        const confirmed =
          window.confirm(
            `Xác nhận thu ${formatMoney(
              amount
            )} cho hóa đơn #${
              selected.sale_tran_id
            }? Sau bước này số tiền sẽ được khóa.`
          );

        if (!confirmed) {
          return;
        }

        setSubmitting(true);
        setError("");
        setNotice("");

        try {
          const result =
            await submitWalletPosAmount(
              token,
              selected.id,
              amount
            );

          if (
            !result?.qr_content ||
            result.status !==
              "qr_ready"
          ) {
            throw new Error(
              "Backend chưa trả QR thanh toán hợp lệ."
            );
          }

          setQrContent(
            result.qr_content
          );

          setSelected(
            previous => ({
              ...previous,
              amount:
                result.amount,
              amount_source:
                result.amount_source,
              status:
                result.status,
              payment_intent_id:
                result.intent_id,
            })
          );

          setNotice(
            "QR đã sẵn sàng. Mời khách mở Cing Wallet và quét mã."
          );

          await loadData({
            silent:
              true,
          });
        } catch (
          nextError
        ) {
          setError(
            nextError
              ?.response
              ?.data
              ?.message ||
            nextError
              ?.message ||
            "Không thể tạo QR thanh toán."
          );
        } finally {
          setSubmitting(false);
        }
      },
      [
        amountInput,
        loadData,
        selected,
        submitting,
        token,
      ]
    );


  const paid =
    selected?.status ===
      "paid" ||
    selected?.status ===
      "reconciliation_pending" ||
    selected?.status ===
      "reconciled" ||
    selected?.status ===
      "reconciliation_mismatch";


  return (
    <div className="cing-pay-counter">
      <header className="cing-pay-counter__hero">
        <div>
          <p>
            CING WALLET · POS COUNTER
          </p>

          <h1>
            Cing Pay
          </h1>

          <span>
            Nhập đúng số tiền trên POS → tạo QR → chờ khách xác nhận.
          </span>
        </div>

        <div className="cing-pay-counter__hero-status">
          <i />
          Đang theo dõi giao dịch
        </div>
      </header>


      {error && (
        <div className="cing-pay-counter__notice is-error">
          {error}
        </div>
      )}

      {notice && (
        <div className="cing-pay-counter__notice is-success">
          {notice}
        </div>
      )}


      <div className="cing-pay-counter__layout">
        <aside className="cing-pay-counter__queue">
          <div className="cing-pay-counter__section-title">
            <div>
              <p>
                HÓA ĐƠN TỪ IPOS
              </p>

              <h2>
                Đang chờ xử lý
              </h2>
            </div>

            <span>
              {activeSessions.length}
            </span>
          </div>

          {loading ? (
            <div className="cing-pay-counter__empty">
              Đang tải...
            </div>
          ) : activeSessions.length === 0 ? (
            <div className="cing-pay-counter__empty">
              Chưa có hóa đơn mới từ iPOS.
            </div>
          ) : (
            <div className="cing-pay-counter__queue-list">
              {activeSessions.map(
                session => (
                  <button
                    type="button"
                    key={
                      session.id
                    }
                    className={[
                      "cing-pay-counter__queue-item",
                      selectedId ===
                      session.id
                        ? "is-active"
                        : "",
                    ].join(" ")}
                    onClick={() =>
                      selectSession(
                        session
                      )
                    }
                  >
                    <div>
                      <strong>
                        Bill #
                        {
                          session.sale_tran_id
                        }
                      </strong>

                      <span>
                        POS {
                          session.pos_id
                        }
                      </span>
                    </div>

                    <small
                      className={`is-${statusTone(
                        session.status
                      )}`}
                    >
                      {statusLabel(
                        session.status
                      )}
                    </small>
                  </button>
                )
              )}
            </div>
          )}
        </aside>


        <main className="cing-pay-counter__workspace">
          {!selected ? (
            <div className="cing-pay-counter__waiting">
              <div>
                ◎
              </div>

              <h2>
                Chờ hóa đơn từ iPOS
              </h2>

              <p>
                Khi Event 2 nhận diện bill, hóa đơn sẽ tự xuất hiện tại đây.
              </p>
            </div>
          ) : (
            <>
              <section className="cing-pay-counter__bill-head">
                <div>
                  <p>
                    HÓA ĐƠN ĐANG CHỌN
                  </p>

                  <h2>
                    #
                    {
                      selected.sale_tran_id
                    }
                  </h2>

                  <span>
                    POS {
                      selected.pos_id
                    } · {
                      selected.pos_parent
                    }
                  </span>
                </div>

                <strong
                  className={`is-${statusTone(
                    selected.status
                  )}`}
                >
                  {statusLabel(
                    selected.status
                  )}
                </strong>
              </section>


              {selected.status ===
                "awaiting_amount" && (
                <section className="cing-pay-counter__amount-panel">
                  <label>
                    Số tiền khách cần trả

                    <div className="cing-pay-counter__amount-input">
                      <input
                        inputMode="numeric"
                        autoComplete="off"
                        value={
                          amountInput
                        }
                        onChange={
                          event =>
                            setAmountInput(
                              parseMoneyInput(
                                event.target
                                  .value
                              )
                            )
                        }
                        placeholder="0"
                      />

                      <span>
                        đ
                      </span>
                    </div>
                  </label>

                  <div className="cing-pay-counter__quick-amounts">
                    {[
                      50000,
                      100000,
                      200000,
                      500000,
                    ].map(
                      value => (
                        <button
                          key={
                            value
                          }
                          type="button"
                          onClick={() =>
                            setAmountInput(
                              new Intl.NumberFormat(
                                "vi-VN"
                              ).format(
                                value
                              )
                            )
                          }
                        >
                          {formatMoney(
                            value
                          )}
                        </button>
                      )
                    )}
                  </div>

                  <button
                    type="button"
                    className="cing-pay-counter__primary"
                    disabled={
                      submitting
                    }
                    onClick={
                      submitAmount
                    }
                  >
                    {submitting
                      ? "Đang tạo QR..."
                      : "Xác nhận số tiền & tạo QR"}
                  </button>

                  <p className="cing-pay-counter__amount-warning">
                    Kiểm tra đúng total cuối cùng trên máy POS sau mọi hạng thành viên, voucher và giảm giá.
                  </p>
                </section>
              )}


              {selected.status !==
                "awaiting_amount" && (
                <section className="cing-pay-counter__payment-panel">
                  <div className="cing-pay-counter__payment-amount">
                    <span>
                      Số tiền đã khóa
                    </span>

                    <strong>
                      {formatMoney(
                        selected.amount
                      )}
                    </strong>

                    <small>
                      Nguồn: {
                        selected.amount_source ===
                        "ipos_api"
                          ? "iPOS API"
                          : "Thu ngân xác nhận"
                      }
                    </small>
                  </div>

                  {qrDataUrl &&
                    selected.status ===
                      "qr_ready" && (
                      <div className="cing-pay-counter__qr">
                        <img
                          src={
                            qrDataUrl
                          }
                          alt="QR thanh toán Cing Wallet"
                        />

                        <strong>
                          Mời khách quét bằng Cing Wallet
                        </strong>

                        <span>
                          Không chụp màn hình QR để sử dụng lại.
                        </span>
                      </div>
                    )}

                  {selected.status ===
                    "qr_ready" &&
                    !qrDataUrl && (
                      <div className="cing-pay-counter__qr-missing">
                        <strong>
                          Đang khôi phục QR
                        </strong>

                        <span>
                          Hệ thống đang tái tạo đúng QR của payment intent hiện hữu, không tạo giao dịch mới.
                        </span>
                      </div>
                    )}

                  {paid && (
                    <div
                      className={[
                        "cing-pay-counter__paid",
                        selected.status ===
                        "reconciliation_mismatch"
                          ? "is-mismatch"
                          : "",
                      ].join(" ")}
                    >
                      <div>
                        {selected.status ===
                        "reconciliation_mismatch"
                          ? "!"
                          : "✓"}
                      </div>

                      <h2>
                        {selected.status ===
                        "reconciliation_mismatch"
                          ? "Đã thanh toán · Cần kiểm tra đối soát"
                          : "Đã thanh toán"}
                      </h2>

                      <strong>
                        {formatMoney(
                          selected.amount
                        )}
                      </strong>

                      <p>
                        {selected.status ===
                        "reconciled"
                          ? "Event 11 đã khớp hoàn toàn."
                          : selected.status ===
                            "reconciliation_mismatch"
                            ? "Không thu thêm hoặc hoàn tiền tự động. Super Admin sẽ nhận cảnh báo."
                            : "Có thể hoàn tất hóa đơn iPOS và chờ Event 11 đối soát."}
                      </p>
                    </div>
                  )}
                </section>
              )}


              <section className="cing-pay-counter__meta">
                <div>
                  <span>
                    Bill iPOS
                  </span>
                  <strong>
                    {
                      selected.sale_tran_id
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Nhận Event 2
                  </span>
                  <strong>
                    {formatTime(
                      selected.last_event2_at
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Trạng thái
                  </span>
                  <strong>
                    {statusLabel(
                      selected.status
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Payment intent
                  </span>
                  <strong>
                    {
                      selected.payment_intent_id
                        ? "Đã tạo"
                        : "Chưa tạo"
                    }
                  </strong>
                </div>
              </section>
            </>
          )}
        </main>
      </div>


      {isSuperAdmin && (
        <section className="cing-pay-counter__alerts">
          <div className="cing-pay-counter__section-title">
            <div>
              <p>
                SUPER ADMIN
              </p>

              <h2>
                Cảnh báo đối soát
              </h2>
            </div>

            <span>
              {alerts.length}
            </span>
          </div>

          {alerts.length === 0 ? (
            <div className="cing-pay-counter__empty is-good">
              Không có cảnh báo đối soát đang mở.
            </div>
          ) : (
            <div className="cing-pay-counter__alert-list">
              {alerts.map(
                alert => (
                  <article
                    key={
                      alert.id
                    }
                    className="cing-pay-counter__alert"
                  >
                    <div>
                      <strong>
                        {alert.alert_type ===
                        "amount_mismatch"
                          ? "Lệch số tiền"
                          : "Bill hoàn tất nhưng payment chưa settled"}
                      </strong>

                      <span>
                        Session {
                          alert.session_id
                        }
                      </span>
                    </div>

                    <div>
                      <span>
                        Cing
                      </span>
                      <strong>
                        {formatMoney(
                          alert.expected_amount
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>
                        iPOS
                      </span>
                      <strong>
                        {formatMoney(
                          alert.actual_amount
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Chênh lệch
                      </span>
                      <strong className="is-danger">
                        {formatMoney(
                          alert.difference_amount
                        )}
                      </strong>
                    </div>
                  </article>
                )
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
