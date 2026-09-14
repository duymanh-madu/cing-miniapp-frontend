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
  createWalletPosManualPayment,
  fetchCurrentWalletPosManualSession,
  fetchWalletPosAlerts,
  resolveWalletPosAlert,

  recoverWalletPosQr,
} from "./adminWalletPosApi";

import {
  getRuntimeSocket,
} from "@/runtime/socket/runtimeSocketClient";

import "./admin-wallet-pos.css";


const POLL_INTERVAL_MS =
  1500;

const QR_RECOVERABLE_STATUS =
  "qr_ready";

const PAID_STATUSES =
  new Set([
    "paid",
    "reconciliation_pending",
  ]);

const BASE_RESOLUTION_ACTIONS = [

  {

    value:

      "manual_review",

    label:

      "Tiếp tục kiểm tra",

  },

  {

    value:

      "accept_as_is",

    label:

      "Chấp nhận hiện trạng",

  },

  {

    value:

      "pos_correction_confirmed",

    label:

      "Đã xác nhận sửa trên iPOS",

  },

];


function getResolutionActions(

  item

) {

  const actions = [

    ...BASE_RESOLUTION_ACTIONS,

  ];

  if (

    item?.alert_type ===

      "amount_mismatch"

  ) {

    const difference =

      Number(

        item?.difference_amount

      );

    if (

      Number.isFinite(

        difference

      ) &&

      difference > 0

    ) {

      actions.push({

        value:

          "compensating_debit",

        label:

          "Thu bổ sung phần thiếu",

      });

    }

    if (

      Number.isFinite(

        difference

      ) &&

      difference < 0

    ) {

      actions.push({

        value:

          "compensating_credit",

        label:

          "Hoàn lại phần thu thừa",

      });

    }

  }

  return actions;

}


const KEYS = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "⌫",
  "0",
  "000",
];


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
    }
  ).format(date);
}


function createRequestId() {
  const cryptoApi =
    globalThis.crypto;

  if (
    !cryptoApi
  ) {
    throw new Error(
      "Thiết bị không hỗ trợ tạo mã giao dịch an toàn."
    );
  }

  if (
    typeof cryptoApi.randomUUID ===
      "function"
  ) {
    return cryptoApi
      .randomUUID();
  }

  if (
    typeof cryptoApi.getRandomValues !==
      "function"
  ) {
    throw new Error(
      "Thiết bị không hỗ trợ tạo mã giao dịch an toàn."
    );
  }

  const bytes =
    new Uint8Array(16);

  cryptoApi.getRandomValues(
    bytes
  );

  bytes[6] =
    (
      bytes[6] &
      0x0f
    ) |
    0x40;

  bytes[8] =
    (
      bytes[8] &
      0x3f
    ) |
    0x80;

  const hex =
    Array.from(
      bytes,
      item =>
        item
          .toString(16)
          .padStart(
            2,
            "0"
          )
    );

  return [
    hex
      .slice(
        0,
        4
      )
      .join(""),
    hex
      .slice(
        4,
        6
      )
      .join(""),
    hex
      .slice(
        6,
        8
      )
      .join(""),
    hex
      .slice(
        8,
        10
      )
      .join(""),
    hex
      .slice(
        10,
        16
      )
      .join(""),
  ].join("-");
}



function appendAmountDigits(
  current,
  digits
) {
  const next =
    `${current}${digits}`
      .replace(
        /^0+(?=\d)/,
        ""
      )
      .slice(
        0,
        10
      );

  if (!next) {
    return "";
  }

  const numeric =
    Number(next);

  if (
    !Number.isSafeInteger(
      numeric
    ) ||
    numeric <= 0
  ) {
    return "";
  }

  return String(
    numeric
  );
}


function errorMessage(
  error
) {
  const code =
    error
      ?.response
      ?.data
      ?.code;

  if (
    code ===
    "CING_WALLET_POS_MANUAL_POS_BUSY"
  ) {
    return "Giao dịch trước vẫn đang chờ hoàn tất. Vui lòng kiểm tra trạng thái thanh toán.";
  }

  if (
    code ===
    "CING_WALLET_POS_COUNTER_IDENTITY_NOT_CONFIGURED"
  ) {
    return "Thiết bị Cing Pay chưa được cấu hình máy POS.";
  }

  if (
    code ===
    "CING_WALLET_POS_COUNTER_DISABLED" ||
    code ===
    "CING_WALLET_POS_EPAYMENT_DISABLED"
  ) {
    return "Cing Pay tại quầy hiện chưa được mở.";
  }

  return (
    error
      ?.response
      ?.data
      ?.message ||
    error
      ?.message ||
    "Không thể xử lý Cing Pay."
  );
}


export default function
AdminWalletPosCounter({
  token,
  role,
}) {
  const [
    amountDigits,
    setAmountDigits,
  ] =
    useState("");

  const [
    current,
    setCurrent,
  ] =
    useState(null);

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
    initialLoading,
    setInitialLoading,
  ] =
    useState(true);

  const [
    refreshing,
    setRefreshing,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    alerts,
    setAlerts,
  ] =
    useState([]);

  const [


    resolutionDrafts,


    setResolutionDrafts,


  ] =


    useState({});


  const [


    resolutionErrors,


    setResolutionErrors,


  ] =


    useState({});


  const [


    resolvingAlertId,


    setResolvingAlertId,


  ] =


    useState(null);


  const resolutionRequestRef =


    useRef(


      new Map()


    );



  const mountedRef =
    useRef(true);

  const loadInFlightRef =
    useRef(false);

  const requestIdRef =
    useRef(null);

  const paidLatchRef =
    useRef(false);

  const previousPaidRef =
    useRef(false);


  const isSuperAdmin =
    String(
      role || ""
    ).toLowerCase() ===
    "super_admin";


  const amount =
    useMemo(
      () => {
        const value =
          Number(
            amountDigits
          );

        return (
          Number.isSafeInteger(
            value
          ) &&
          value > 0
        )
          ? value
          : 0;
      },
      [
        amountDigits,
      ]
    );


  const paid =
    Boolean(
      current &&
      (
        paidLatchRef.current ||
        PAID_STATUSES.has(
          current.status
        )
      )
    );


  const loadAlerts =

    useCallback(

      async ({

        strict = false,

      } = {}) => {

        if (!isSuperAdmin) {

          return [];

        }

        try {

          const next =

            await fetchWalletPosAlerts(

              token,

              {

                status:

                  "open",

                limit:

                  100,

              }

            );

          if (

            mountedRef.current

          ) {

            setAlerts(

              next

            );

          }

          return next;

        } catch (

          alertError

        ) {

          if (strict) {

            throw alertError;

          }

          return null;

        }

      },

      [

        isSuperAdmin,

        token,

      ]

    );


  const loadCurrent =
    useCallback(
      async ({
        silent = false,
      } = {}) => {
        if (
          loadInFlightRef.current
        ) {
          return;
        }

        loadInFlightRef.current =
          true;

        if (!silent) {
          setRefreshing(true);
        }

        try {
          const next =
            await fetchCurrentWalletPosManualSession(
              token
            );

          if (
            !mountedRef.current
          ) {
            return;
          }

          if (
            next &&
            PAID_STATUSES.has(
              next.status
            )
          ) {
            paidLatchRef.current =
              true;
          }

          if (next) {
            setCurrent(
              previous => ({
                ...previous,
                ...next,
              })
            );
          } else if (
            !paidLatchRef.current
          ) {
            setCurrent(
              null
            );
            setQrContent(
              ""
            );
            setQrDataUrl(
              ""
            );
          }

          setError("");
        } catch (
          nextError
        ) {
          if (
            mountedRef.current
          ) {
            setError(
              errorMessage(
                nextError
              )
            );
          }
        } finally {
          loadInFlightRef.current =
            false;

          if (
            mountedRef.current &&
            !silent
          ) {
            setRefreshing(false);
          }
        }
      },
      [
        token,
      ]
    );


  useEffect(
    () => {
      mountedRef.current =
        true;

      const boot =
        async () => {
          await loadCurrent();

          if (
            mountedRef.current
          ) {
            setInitialLoading(
              false
            );
          }

          void loadAlerts();
        };

      void boot();

      const timer =
        window.setInterval(
          () => {
            void loadCurrent({
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
      loadAlerts,
      loadCurrent,
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
        () => {
          if (disposed) {
            return;
          }

          void loadCurrent({
            silent:
              true,
          });

          void loadAlerts();
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

          for (
            const event
            of events
          ) {
            socket.on(
              event,
              handleRealtime
            );
          }
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
          for (
            const event
            of events
          ) {
            socket.off(
              event,
              handleRealtime
            );
          }
        }
      };
    },
    [
      loadAlerts,
      loadCurrent,
    ]
  );


  useEffect(
    () => {
      if (
        !current?.id ||
        current.status !==
          QR_RECOVERABLE_STATUS ||
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
                current.id
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

            setCurrent(
              previous => ({
                ...previous,
                amount:
                  recovered.amount,
                payment_intent_id:
                  recovered
                    .payment_intent_id,
                status:
                  recovered.status,
                expires_at:
                  recovered.expires_at,
              })
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
                "QR thanh toán đã hết hạn."
              );
            } else {
              setError(
                errorMessage(
                  recoveryError
                )
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
      current?.id,
      current?.status,
      qrContent,
      token,
    ]
  );


  useEffect(
    () => {
      let cancelled =
        false;

      async function renderQr() {
        if (!qrContent) {
          setQrDataUrl(
            ""
          );

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
              "Không thể hiển thị QR thanh toán."
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


  useEffect(
    () => {
      const nextPaid =
        Boolean(
          current &&
          PAID_STATUSES.has(
            current.status
          )
        );

      if (
        nextPaid &&
        !previousPaidRef.current
      ) {
        paidLatchRef.current =
          true;
      }

      previousPaidRef.current =
        nextPaid;
    },
    [
      current,
    ]
  );


  const changeAmount =
    useCallback(
      next => {
        if (
          submitting ||
          current
        ) {
          return;
        }

        requestIdRef.current =
          null;

        setAmountDigits(
          next
        );

        setError("");
      },
      [
        current,
        submitting,
      ]
    );


  const pressKey =
    useCallback(
      key => {
        if (
          key ===
          "⌫"
        ) {
          changeAmount(
            amountDigits.slice(
              0,
              -1
            )
          );

          return;
        }

        changeAmount(
          appendAmountDigits(
            amountDigits,
            key
          )
        );
      },
      [
        amountDigits,
        changeAmount,
      ]
    );


  const createQr =
    useCallback(
      async () => {
        if (
          submitting ||
          current ||
          !amount
        ) {
          return;
        }

        setSubmitting(
          true
        );

        setError("");

        try {
          const requestId =
            requestIdRef.current ||
            createRequestId();

          requestIdRef.current =
            requestId;

          const result =
            await createWalletPosManualPayment(
              token,
              {
                amount,
                requestId,
              }
            );

          if (
            !result?.session_id ||
            !result?.qr_content ||
            result.status !==
              "qr_ready"
          ) {
            throw new Error(
              "Backend chưa trả QR thanh toán hợp lệ."
            );
          }

          if (
            Number(
              result.amount
            ) !==
            amount
          ) {
            throw new Error(
              "Số tiền QR không khớp số tiền đã nhập."
            );
          }

          setCurrent({
            id:
              result.session_id,
            payment_intent_id:
              result
                .payment_intent_id,
            amount:
              result.amount,
            amount_source:
              result.amount_source,
            status:
              result.status,
            expires_at:
              result.expires_at,
          });

          setQrContent(
            result.qr_content
          );

          void loadCurrent({
            silent:
              true,
          });
        } catch (
          nextError
        ) {
          setError(
            errorMessage(
              nextError
            )
          );
        } finally {
          setSubmitting(
            false
          );
        }
      },
      [
        amount,
        current,
        loadCurrent,
        submitting,
        token,
      ]
    );


  const updateResolutionDraft =

    useCallback(

      (

        alertId,

        patch

      ) => {

        setResolutionDrafts(

          previous => ({

            ...previous,

            [alertId]: {

              ...(previous[alertId] ||

                {}),

              ...patch,

            },

          })

        );

        setResolutionErrors(

          previous => {

            if (

              !previous[alertId]

            ) {

              return previous;

            }

            const next = {

              ...previous,

            };

            delete next[alertId];

            return next;

          }

        );

      },

      []

    );


  const resolveAlert =

    useCallback(

      async item => {

        if (

          !isSuperAdmin ||

          !item?.id ||

          resolvingAlertId

        ) {

          return;

        }

        const draft =

          resolutionDrafts[

            item.id

          ] || {};

        const resolutionAction =

          String(

            draft

              .resolution_action ||

            "manual_review"

          )
            .trim()
            .toLowerCase();

        const reasonCode =

          String(

            draft.reason_code ||

            ""

          )
            .trim()
            .toLowerCase();

        const note =

          String(

            draft.note ||

            ""

          ).trim();

        if (

          !/^[a-z0-9][a-z0-9_]{1,63}$/

            .test(

              reasonCode

            )

        ) {

          setResolutionErrors(

            previous => ({

              ...previous,

              [item.id]:

                "Mã lý do chỉ gồm chữ thường, số và dấu gạch dưới.",

            })

          );

          return;

        }

        const allowedActions =

          getResolutionActions(

            item

          ).map(

            action =>

              action.value

          );

        if (

          !allowedActions.includes(

            resolutionAction

          )

        ) {

          setResolutionErrors(

            previous => ({

              ...previous,

              [item.id]:

                "Hành động này không phù hợp với chênh lệch hiện tại.",

            })

          );

          return;

        }

        const isFinancial =

          [

            "compensating_debit",

            "compensating_credit",

          ].includes(

            resolutionAction

          );

        if (

          isFinancial &&

          !note

        ) {

          setResolutionErrors(

            previous => ({

              ...previous,

              [item.id]:

                "Điều chỉnh số dư bắt buộc phải có ghi chú.",

            })

          );

          return;

        }

        setResolvingAlertId(

          item.id

        );

        setResolutionErrors(

          previous => {

            const next = {

              ...previous,

            };

            delete next[

              item.id

            ];

            return next;

          }

        );

        try {

          const fingerprint =

            [

              item.id,

              resolutionAction,

              reasonCode,

              note,

            ].join("|");

          let requestId =

            resolutionRequestRef

              .current

              .get(

                fingerprint

              );

          if (!requestId) {

            requestId =

              createRequestId();

            resolutionRequestRef

              .current

              .set(

                fingerprint,

                requestId

              );

          }

          const result =

            await resolveWalletPosAlert(

              token,

              item.id,

              {

                requestId,

                resolutionAction,

                reasonCode,

                note:

                  note ||

                  null,

              }

            );

          if (

            !result

              ?.resolution_id ||

            result.alert_id !==

              item.id

          ) {

            throw new Error(

              "Backend chưa trả kết quả xử lý đối soát hợp lệ."

            );

          }

          await loadAlerts({

            strict:

              true,

          });

          resolutionRequestRef

            .current

            .delete(

              fingerprint

            );

          if (

            mountedRef.current

          ) {

            setResolutionDrafts(

              previous => {

                const next = {

                  ...previous,

                };

                delete next[

                  item.id

                ];

                return next;

              }

            );

          }

        } catch (

          nextError

        ) {

          if (

            mountedRef.current

          ) {

            setResolutionErrors(

              previous => ({

                ...previous,

                [item.id]:

                  errorMessage(

                    nextError

                  ),

              })

            );

          }

        } finally {

          if (

            mountedRef.current

          ) {

            setResolvingAlertId(

              null

            );

          }

        }

      },

      [

        isSuperAdmin,

        loadAlerts,

        resolutionDrafts,

        resolvingAlertId,

        token,

      ]

    );


  const nextTransaction =
    useCallback(
      async () => {
        paidLatchRef.current =
          false;

        previousPaidRef.current =
          false;

        requestIdRef.current =
          null;

        setCurrent(
          null
        );

        setAmountDigits(
          ""
        );

        setQrContent(
          ""
        );

        setQrDataUrl(
          ""
        );

        setError(
          ""
        );

        await loadCurrent({
          silent:
            true,
        });
      },
      [
        loadCurrent,
      ]
    );


  if (initialLoading) {
    return (
      <div className="cing-pay-counter">
        <div className="cing-pay-counter__loading">
          <span />
          <strong>
            Đang mở Cing Pay...
          </strong>
        </div>
      </div>
    );
  }


  const phase =
    paid
      ? "paid"
      : current
        ?.status ===
        "qr_ready"
        ? "qr"
        : current
          ? "recovering"
          : "ready";


  return (
    <div className="cing-pay-counter">
      <header className="cing-pay-counter__hero">
        <div>
          <p>
            CING WALLET · THANH TOÁN TẠI QUẦY
          </p>

          <h1>
            Cing Pay
          </h1>

          <span>
            Nhập đúng tổng tiền đang hiển thị trên máy iPOS.
          </span>
        </div>

        <div className="cing-pay-counter__hero-status">
          <i />
          Sẵn sàng
        </div>
      </header>


      {error
        ? (
          <div className="cing-pay-counter__notice is-error">
            {error}
          </div>
        )
        : null}


      {phase ===
        "ready"
        ? (
          <main className="cing-pay-counter__checkout">
            <section className="cing-pay-counter__amount-card">
              <p>
                TỔNG TIỀN TRÊN iPOS
              </p>

              <div className="cing-pay-counter__amount-display">
                {amount
                  ? formatMoney(
                      amount
                    )
                  : "0đ"}
              </div>

              <div className="cing-pay-counter__keypad">
                {KEYS.map(
                  key => (
                    <button
                      key={key}
                      type="button"
                      className={
                        key ===
                        "⌫"
                          ? "is-backspace"
                          : key ===
                            "000"
                            ? "is-thousand"
                            : ""
                      }
                      disabled={
                        submitting
                      }
                      onClick={
                        () =>
                          pressKey(
                            key
                          )
                      }
                    >
                      {key}
                    </button>
                  )
                )}
              </div>

              <button
                type="button"
                className="cing-pay-counter__primary"
                disabled={
                  !amount ||
                  submitting
                }
                onClick={
                  createQr
                }
              >
                {submitting
                  ? "ĐANG TẠO QR..."
                  : amount
                    ? `TẠO QR ${formatMoney(
                        amount
                      )}`
                    : "NHẬP SỐ TIỀN"}
              </button>

              <small className="cing-pay-counter__hint">
                Số tiền chỉ được gửi lên hệ thống khi bấm Tạo QR.
              </small>
            </section>
          </main>
        )
        : null}


      {phase ===
        "recovering"
        ? (
          <main className="cing-pay-counter__checkout">
            <section className="cing-pay-counter__state-card">
              <div className="cing-pay-counter__spinner" />

              <h2>
                Đang khôi phục giao dịch
              </h2>

              <p>
                Hệ thống đang lấy trạng thái thanh toán hiện tại.
              </p>

              <button
                type="button"
                className="cing-pay-counter__secondary"
                disabled={
                  refreshing
                }
                onClick={
                  () =>
                    loadCurrent()
                }
              >
                TẢI LẠI
              </button>
            </section>
          </main>
        )
        : null}


      {phase ===
        "qr"
        ? (
          <main className="cing-pay-counter__checkout">
            <section className="cing-pay-counter__qr-card">
              <div className="cing-pay-counter__qr-copy">
                <p>
                  KHÁCH CẦN THANH TOÁN
                </p>

                <strong>
                  {formatMoney(
                    current?.amount
                  )}
                </strong>

                <h2>
                  Quét QR bằng Cing Wallet
                </h2>

                <span>
                  Khách mở Cing Wallet và quét mã để xác nhận thanh toán.
                </span>

                <small>
                  QR hiệu lực đến{" "}
                  {formatTime(
                    current?.expires_at
                  )}
                </small>
              </div>

              <div className="cing-pay-counter__qr">
                {qrDataUrl
                  ? (
                    <img
                      src={
                        qrDataUrl
                      }
                      alt="QR thanh toán Cing Wallet"
                    />
                  )
                  : (
                    <div className="cing-pay-counter__qr-loading">
                      <div className="cing-pay-counter__spinner" />
                      <span>
                        Đang hiển thị QR...
                      </span>
                    </div>
                  )}
              </div>

              <div className="cing-pay-counter__waiting-payment">
                <i />
                Đang chờ khách thanh toán
              </div>
            </section>
          </main>
        )
        : null}


      {phase ===
        "paid"
        ? (
          <main className="cing-pay-counter__checkout">
            <section className="cing-pay-counter__paid">
              <div className="cing-pay-counter__paid-icon">
                ✓
              </div>

              <p>
                CING WALLET
              </p>

              <h2>
                ĐÃ THANH TOÁN
              </h2>

              <strong>
                {formatMoney(
                  current?.amount
                )}
              </strong>

              <span>
                Có thể hoàn tất hóa đơn trên iPOS
              </span>

              <button
                type="button"
                className="cing-pay-counter__next"
                onClick={
                  nextTransaction
                }
              >
                GIAO DỊCH TIẾP THEO
              </button>
            </section>
          </main>
        )
        : null}


      {isSuperAdmin &&
      alerts.length > 0
        ? (
          <section className="cing-pay-counter__backoffice">
            <details>
              <summary>
                Cảnh báo đối soát
                <strong>
                  {alerts.length}
                </strong>
              </summary>

              <div className="cing-pay-counter__alert-list">
                {alerts.map(

                  item => {

                    const draft =

                      resolutionDrafts[

                        item.id

                      ] || {};

                    const selectedAction =

                      draft

                        .resolution_action ||

                      "manual_review";

                    const actions =

                      getResolutionActions(

                        item

                      );

                    const resolving =

                      resolvingAlertId ===

                      item.id;

                    const financial =

                      [

                        "compensating_debit",

                        "compensating_credit",

                      ].includes(

                        selectedAction

                      );

                    return (

                      <article

                        key={

                          item.id

                        }

                        className="cing-pay-counter__alert"

                      >

                        <div>

                          <span>

                            Loại cảnh báo

                          </span>

                          <strong>

                            {item.alert_type ||

                              "Cần kiểm tra"}

                          </strong>

                        </div>

                        <div>

                          <span>

                            Cing Wallet

                          </span>

                          <strong>

                            {formatMoney(

                              item

                                .expected_amount

                            )}

                          </strong>

                        </div>

                        <div>

                          <span>

                            iPOS

                          </span>

                          <strong>

                            {formatMoney(

                              item

                                .actual_amount

                            )}

                          </strong>

                        </div>

                        <div>

                          <span>

                            Chênh lệch

                          </span>

                          <strong>

                            {formatMoney(

                              item

                                .difference_amount

                            )}

                          </strong>

                        </div>

                        <div>

                          <span>

                            Phát hiện

                          </span>

                          <strong>

                            {formatTime(

                              item

                                .last_detected_at ||

                              item

                                .first_detected_at

                            )}

                          </strong>

                        </div>

                        <div className="cing-pay-counter__resolution">

                          <div className="cing-pay-counter__resolution-title">

                            <strong>

                              Xử lý đối soát

                            </strong>

                            <span>

                              Hệ thống tự xác định khách hàng và số tiền điều chỉnh từ dữ liệu đối soát.

                            </span>

                          </div>

                          <label>

                            <span>

                              Quyết định

                            </span>

                            <select

                              value={

                                selectedAction

                              }

                              disabled={

                                resolving

                              }

                              onChange={

                                event =>

                                  updateResolutionDraft(

                                    item.id,

                                    {

                                      resolution_action:

                                        event

                                          .target

                                          .value,

                                    }

                                  )

                              }

                            >

                              {actions.map(

                                action => (

                                  <option

                                    key={

                                      action.value

                                    }

                                    value={

                                      action.value

                                    }

                                  >

                                    {action.label}

                                  </option>

                                )

                              )}

                            </select>

                          </label>

                          <label>

                            <span>

                              Mã lý do

                            </span>

                            <input

                              type="text"

                              value={

                                draft

                                  .reason_code ||

                                ""

                              }

                              disabled={

                                resolving

                              }

                              maxLength={

                                64

                              }

                              autoComplete="off"

                              placeholder="vi_du: da_xac_minh"

                              onChange={

                                event =>

                                  updateResolutionDraft(

                                    item.id,

                                    {

                                      reason_code:

                                        event

                                          .target

                                          .value,

                                    }

                                  )

                              }

                            />

                          </label>

                          <label className="is-note">

                            <span>

                              Ghi chú

                              {financial

                                ? " · bắt buộc"

                                : ""}

                            </span>

                            <textarea

                              value={

                                draft.note ||

                                ""

                              }

                              disabled={

                                resolving

                              }

                              maxLength={

                                1000

                              }

                              placeholder={

                                financial

                                  ? "Ghi rõ căn cứ điều chỉnh số dư"

                                  : "Thông tin phục vụ kiểm tra"

                              }

                              onChange={

                                event =>

                                  updateResolutionDraft(

                                    item.id,

                                    {

                                      note:

                                        event

                                          .target

                                          .value,

                                    }

                                  )

                              }

                            />

                          </label>

                          {resolutionErrors[

                            item.id

                          ]

                            ? (

                              <div className="cing-pay-counter__resolution-error">

                                {resolutionErrors[

                                  item.id

                                ]}

                              </div>

                            )

                            : null}

                          <button

                            type="button"

                            className="cing-pay-counter__resolve"

                            disabled={

                              resolving ||

                              !String(

                                draft

                                  .reason_code ||

                                ""

                              ).trim() ||

                              (

                                financial &&

                                !String(

                                  draft.note ||

                                  ""

                                ).trim()

                              )

                            }

                            onClick={

                              () =>

                                resolveAlert(

                                  item

                                )

                            }

                          >

                            {resolving

                              ? "ĐANG XỬ LÝ..."

                              : "XÁC NHẬN QUYẾT ĐỊNH"}

                          </button>

                        </div>

                      </article>

                    );

                  }

                )}
              </div>
            </details>
          </section>
        )
        : null}
    </div>
  );
}
