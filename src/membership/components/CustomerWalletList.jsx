import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  openOutApp,
} from "zmp-sdk/apis";

import apiClient from "@/infra/api/apiClient";

const fmt = (value) =>
  `${new Intl.NumberFormat("vi-VN").format(
    Number(value || 0)
  )}đ`;

const PENDING_KEY =
  "cing_wallet_pending_topup_v1";

async function openMomoPayment({
  deeplinkMiniApp,
  paymentUrl,
}) {
  const nativeUrl =
    typeof deeplinkMiniApp === "string"
      ? deeplinkMiniApp.trim()
      : "";

  const fallbackUrl =
    typeof paymentUrl === "string"
      ? paymentUrl.trim()
      : "";

  if (nativeUrl) {
    try {
      await openOutApp({
        url: nativeUrl,
      });

      return;
    } catch {
      /*
       * Zalo native bridge can be unavailable
       * outside the Mini App runtime.
       * Provider-hosted URL remains the safe
       * compatibility fallback.
       */
    }
  }

  if (fallbackUrl) {
    window.location.assign(
      fallbackUrl
    );

    return;
  }

  throw new Error(
    "Không nhận được liên kết thanh toán MoMo."
  );
}

function safeMoney(value) {
  const amount =
    Number(value);

  return Number.isSafeInteger(
    amount
  ) && amount >= 0
    ? amount
    : 0;
}

function resolveBalance(data) {
  return safeMoney(
    data?.effective_balance ??
    data?.balance ??
    data?.wallet_balance ??
    data?.account?.balance ??
    0
  );
}

function resolveTransactions(data) {
  const candidates = [
    data?.transactions,
    data?.statement,
    data?.items,
    data?.history,
    data?.data,
  ];

  for (const value of candidates) {
    if (Array.isArray(value)) {
      return value;
    }
  }

  return [];
}

function readPendingTopup() {
  try {
    const raw =
      sessionStorage.getItem(
        PENDING_KEY
      );

    if (!raw) {
      return null;
    }

    const value =
      JSON.parse(raw);

    if (
      !Number.isSafeInteger(
        Number(value?.amount)
      ) ||
      Number(value.amount) <= 0
    ) {
      return null;
    }

    return value;
  } catch {
    return null;
  }
}

function writePendingTopup(
  value
) {
  try {
    sessionStorage.setItem(
      PENDING_KEY,
      JSON.stringify(value)
    );
  } catch {
    // Storage failure must never affect
    // financial authority.
  }
}

function clearPendingTopup() {
  try {
    sessionStorage.removeItem(
      PENDING_KEY
    );
  } catch {
    // Presentation-only storage.
  }
}

function transactionMatchesPending(
  transaction,
  pending
) {
  if (
    !transaction ||
    !pending?.transactionCode
  ) {
    return false;
  }

  return JSON.stringify(
    transaction
  )
    .toLowerCase()
    .includes(
      String(
        pending.transactionCode
      ).toLowerCase()
    );
}

function normalizePromotion(
  data
) {
  if (!data) {
    return null;
  }

  if (
    data.active === false ||
    data.enabled === false
  ) {
    return null;
  }

  const tiers =
    Array.isArray(data.tiers)
      ? data.tiers
      : Array.isArray(
          data.promotion_tiers
        )
        ? data.promotion_tiers
        : [];

  return {
    ...data,
    tiers,
  };
}

function CustomerWalletList() {
  const [walletLoading,
    setWalletLoading] =
    useState(true);

  const [balance,
    setBalance] =
    useState(0);

  const [transactions,
    setTransactions] =
    useState([]);

  const [promotion,
    setPromotion] =
    useState(null);

  const [amountInput,
    setAmountInput] =
    useState("");

  const [submitting,
    setSubmitting] =
    useState(false);

  const [error,
    setError] =
    useState("");

  const [notice,
    setNotice] =
    useState("");

  const [pendingTopup,
    setPendingTopup] =
    useState(() =>
      readPendingTopup()
    );

  const [reopenUrl,
    setReopenUrl] =
    useState(
      () =>
        readPendingTopup()
          ?.paymentUrl || ""
    );

  const [
    reopenDeeplinkMiniApp,
    setReopenDeeplinkMiniApp,
  ] =
    useState(
      () =>
        readPendingTopup()
          ?.deeplinkMiniApp || ""
    );

  const refreshInFlight =
    useRef(false);

  const refreshWallet =
    useCallback(
      async ({
        silent = false,
      } = {}) => {
        if (
          refreshInFlight.current
        ) {
          return;
        }

        refreshInFlight.current =
          true;

        if (!silent) {
          setWalletLoading(true);
        }

        try {
          const [
            overviewRes,
            promotionRes,
          ] = await Promise.all([
            apiClient.get(
              "/wallet",
              {
                params: {
                  limit:
                    20,
                },
              }
            ),

            apiClient.get(
              "/wallet/topup/promotion"
            ),
          ]);

          const overview =
            overviewRes.data?.data ||
            {};

          const nextBalance =
            resolveBalance(
              overview
            );

          const firstPage =
            resolveTransactions(
              overview
            );

          setBalance(
            nextBalance
          );

          setTransactions(
            firstPage
          );

          setPromotion(
            normalizePromotion(
              promotionRes.data
                ?.data
            )
          );

          const pending =
            readPendingTopup();

          if (pending) {
            const matched =
              firstPage.some(
                (row) =>
                  transactionMatchesPending(
                    row,
                    pending
                  )
              );

            const balanceAdvanced =
              Number.isSafeInteger(
                Number(
                  pending
                    .baselineBalance
                )
              ) &&
              nextBalance >=
                Number(
                  pending
                    .baselineBalance
                ) +
                  Number(
                    pending.amount
                  );

            if (
              matched ||
              balanceAdvanced
            ) {
              clearPendingTopup();

              setPendingTopup(
                null
              );

              setReopenUrl("");
              setReopenDeeplinkMiniApp(
                ""
              );

              setNotice(
                "Nạp Cing Wallet đã được xác nhận."
              );

              setError("");
            } else {
              setPendingTopup(
                pending
              );

              setReopenUrl(
                pending.paymentUrl ||
                  ""
              );
              setReopenDeeplinkMiniApp(
                pending.deeplinkMiniApp ||
                  ""
              );

              setNotice(
                "Giao dịch đang được hệ thống xác minh. Nếu bạn đã thanh toán, không cần nạp lại."
              );
            }
          }
        } catch (e) {
          if (!silent) {
            setError(
              e?.response?.data
                ?.message ||
                "Không thể tải Cing Wallet."
            );
          }
        } finally {
          refreshInFlight.current =
            false;

          if (!silent) {
            setWalletLoading(
              false
            );
          }
        }
      },
      []
    );

  useEffect(() => {
    refreshWallet();
  }, [refreshWallet]);

  useEffect(() => {
    const refreshAfterReturn =
      () => {
        if (
          document.visibilityState ===
          "visible"
        ) {
          refreshWallet({
            silent: true,
          });
        }
      };

    window.addEventListener(
      "focus",
      refreshAfterReturn
    );

    document.addEventListener(
      "visibilitychange",
      refreshAfterReturn
    );

    return () => {
      window.removeEventListener(
        "focus",
        refreshAfterReturn
      );

      document.removeEventListener(
        "visibilitychange",
        refreshAfterReturn
      );
    };
  }, [refreshWallet]);

  useEffect(() => {
    if (!pendingTopup) {
      return undefined;
    }

    const timer =
      window.setInterval(
        () => {
          refreshWallet({
            silent: true,
          });
        },
        5000
      );

    return () =>
      window.clearInterval(
        timer
      );
  }, [
    pendingTopup,
    refreshWallet,
  ]);

  const promotionTiers =
    useMemo(
      () =>
        (
          promotion?.tiers || []
        )
          .map((tier) => ({
            ...tier,
            minAmount:
              safeMoney(
                tier
                  ?.min_topup_amount ??
                  tier
                    ?.minTopupAmount
              ),
          }))
          .filter(
            (tier) =>
              tier.minAmount > 0
          )
          .sort(
            (a, b) =>
              a.minAmount -
              b.minAmount
          ),
      [promotion]
    );

  async function handleTopup() {
    if (
      submitting ||
      pendingTopup
    ) {
      return;
    }

    const normalized =
      String(
        amountInput || ""
      )
        .replace(/\D/g, "");

    const amount =
      Number(normalized);

    if (
      !Number.isSafeInteger(
        amount
      ) ||
      amount <= 0
    ) {
      setError(
        "Vui lòng nhập số tiền nạp hợp lệ."
      );
      return;
    }

    setSubmitting(true);
    setError("");
    setNotice("");

    try {
      /*
       * Financial boundary:
       * amount is the only client-owned
       * value accepted by this endpoint.
       */
      const response =
        await apiClient.post(
          "/wallet/topup/session",
          {
            amount,
          }
        );

      const data =
        response.data?.data;

      const paymentSession =
        data?.payment;

      const paymentRecord =
        paymentSession?.payment;

      if (
        response.data?.success !== true ||
        paymentSession?.success !== true ||
        !paymentRecord
      ) {
        throw new Error(
          response.data?.message ||
            "Không thể tạo phiên nạp Cing Wallet."
        );
      }

      if (
        Number(data.amount) !==
        amount
      ) {
        throw new Error(
          "Số tiền phiên thanh toán không khớp."
        );
      }

      if (
        Number(paymentRecord.amount) !==
        amount
      ) {
        throw new Error(
          "Số tiền giao dịch MoMo không khớp."
        );
      }

      if (
        paymentRecord.payment_purpose !==
        "wallet_topup"
      ) {
        throw new Error(
          "Sai mục đích giao dịch Cing Wallet."
        );
      }

      if (
        paymentRecord.payment_provider !==
          "momo" ||
        paymentRecord.payment_method !==
          "momo"
      ) {
        throw new Error(
          "Sai phương thức thanh toán Cing Wallet."
        );
      }

      const paymentUrl =
        typeof paymentSession.paymentUrl ===
          "string"
          ? paymentSession.paymentUrl.trim()
          : "";

      const deeplinkMiniApp =
        typeof paymentSession.deeplinkMiniApp ===
          "string"
          ? paymentSession.deeplinkMiniApp.trim()
          : "";

      const transactionCode =
        typeof paymentRecord.transaction_code ===
          "string"
          ? paymentRecord.transaction_code.trim()
          : "";

      if (
        !deeplinkMiniApp &&
        !paymentUrl
      ) {
        throw new Error(
          "Không nhận được liên kết thanh toán MoMo."
        );
      }

      if (!transactionCode) {
        throw new Error(
          "Không nhận được mã giao dịch Cing Wallet."
        );
      }

      const pending = {
        amount,
        baselineBalance:
          balance,
        transactionCode,
        paymentUrl,
        deeplinkMiniApp,
        expiredAt:
          paymentSession.expired_at || null,
        createdAt:
          Date.now(),
      };

      writePendingTopup(
        pending
      );

      setPendingTopup(
        pending
      );

      setReopenUrl(
        paymentUrl
      );
      setReopenDeeplinkMiniApp(
        deeplinkMiniApp
      );

      setNotice(
        "Đã tạo phiên nạp. Sau khi thanh toán, hệ thống sẽ tự xác minh và cập nhật số dư."
      );

      /*
       * Prefer MoMo's Mini App native
       * deeplink through Zalo's native
       * bridge. Hosted payUrl remains
       * compatibility fallback only.
       *
       * No Wallet mutation happens here.
       */
      await openMomoPayment({
        deeplinkMiniApp,
        paymentUrl,
      });
    } catch (e) {
      setError(
        e?.response?.data
          ?.message ||
          e?.message ||
          "Không thể tạo phiên nạp Cing Wallet."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section
      style={{
        background:
          "white",
        borderRadius:
          20,
        padding:
          20,
        marginBottom:
          16,
        boxShadow:
          "0 2px 12px rgba(0,0,0,0.06)",
      }}
    >
      <div
        style={{
          display:
            "flex",
          alignItems:
            "flex-start",
          justifyContent:
            "space-between",
          gap:
            12,
          marginBottom:
            16,
        }}
      >
        <div>
          <p
            style={{
              margin:
                "0 0 4px",
              fontSize:
                15,
              fontWeight:
                900,
              color:
                "#1a1a1a",
            }}
          >
            🧡 Cing Wallet
          </p>

          <p
            style={{
              margin:
                0,
              fontSize:
                11,
              color:
                "#999",
              lineHeight:
                1.5,
            }}
          >
            Nạp trước, thanh toán
            đơn hàng bằng số dư
            Wallet.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            refreshWallet()
          }
          disabled={
            walletLoading
          }
          style={{
            border:
              "none",
            background:
              "#fff7f0",
            color:
              "#D4531C",
            borderRadius:
              10,
            padding:
              "7px 10px",
            fontSize:
              11,
            fontWeight:
              800,
            cursor:
              "pointer",
          }}
        >
          Làm mới
        </button>
      </div>

      <div
        style={{
          background:
            "linear-gradient(135deg,#D4531C,#E8622A)",
          color:
            "white",
          borderRadius:
            18,
          padding:
            "18px 18px",
          marginBottom:
            16,
        }}
      >
        <p
          style={{
            margin:
              "0 0 5px",
            fontSize:
              11,
            opacity:
              0.8,
          }}
        >
          Số dư hiện tại
        </p>

        <p
          style={{
            margin:
              0,
            fontSize:
              30,
            lineHeight:
              1.1,
            fontWeight:
              900,
          }}
        >
          {walletLoading
            ? "..."
            : fmt(
                balance
              )}
        </p>

        <p
          style={{
            margin:
              "8px 0 0",
            fontSize:
              10,
            opacity:
              0.75,
          }}
        >
          Số dư hiển thị theo
          authority của hệ thống.
        </p>
      </div>

      {promotion && (
        <div
          style={{
            background:
              "#fff8ed",
            border:
              "1px solid #fed7aa",
            borderRadius:
              14,
            padding:
              12,
            marginBottom:
              14,
          }}
        >
          <p
            style={{
              margin:
                "0 0 6px",
              fontSize:
                12,
              fontWeight:
                900,
              color:
                "#9a3412",
            }}
          >
            🎁 Ưu đãi nạp ví
          </p>

          {promotionTiers
            .length > 0 ? (
            <div
              style={{
                display:
                  "flex",
                gap:
                  6,
                flexWrap:
                  "wrap",
              }}
            >
              {promotionTiers.map(
                (
                  tier,
                  index
                ) => (
                  <button
                    key={
                      tier.id ??
                      index
                    }
                    type="button"
                    onClick={() =>
                      setAmountInput(
                        String(
                          tier.minAmount
                        )
                      )
                    }
                    style={{
                      border:
                        "1px solid #fdba74",
                      background:
                        "white",
                      color:
                        "#9a3412",
                      borderRadius:
                        999,
                      padding:
                        "6px 10px",
                      fontSize:
                        11,
                      fontWeight:
                        800,
                      cursor:
                        "pointer",
                    }}
                  >
                    Từ{" "}
                    {fmt(
                      tier.minAmount
                    )}
                  </button>
                )
              )}
            </div>
          ) : (
            <p
              style={{
                margin:
                  0,
                fontSize:
                  11,
                color:
                  "#9a3412",
              }}
            >
              Chương trình ưu đãi
              đang được áp dụng
              theo cấu hình hệ
              thống.
            </p>
          )}
        </div>
      )}

      <label
        style={{
          display:
            "block",
          fontSize:
            12,
          fontWeight:
            800,
          color:
            "#333",
          marginBottom:
            6,
        }}
      >
        Số tiền muốn nạp
      </label>

      <div
        style={{
          display:
            "flex",
          gap:
            8,
        }}
      >
        <input
          inputMode="numeric"
          value={
            amountInput
          }
          disabled={
            submitting ||
            Boolean(
              pendingTopup
            )
          }
          onChange={(event) =>
            setAmountInput(
              event.target.value
                .replace(
                  /\D/g,
                  ""
                )
            )
          }
          placeholder="Nhập số tiền"
          style={{
            flex:
              1,
            minWidth:
              0,
            border:
              "1.5px solid #eee",
            borderRadius:
              12,
            padding:
              "11px 12px",
            outline:
              "none",
            fontSize:
              14,
            fontWeight:
              800,
          }}
        />

        <button
          type="button"
          onClick={
            handleTopup
          }
          disabled={
            submitting ||
            Boolean(
              pendingTopup
            )
          }
          style={{
            border:
              "none",
            borderRadius:
              12,
            padding:
              "0 16px",
            background:
              submitting ||
              pendingTopup
                ? "#ddd"
                : "#D4531C",
            color:
              "white",
            fontSize:
              13,
            fontWeight:
              900,
            cursor:
              submitting ||
              pendingTopup
                ? "not-allowed"
                : "pointer",
          }}
        >
          {submitting
            ? "Đang tạo..."
            : "Nạp tiền"}
        </button>
      </div>

      {amountInput && (
        <p
          style={{
            margin:
              "7px 0 0",
            fontSize:
              11,
            color:
              "#777",
          }}
        >
          Số tiền yêu cầu:{" "}
          <strong>
            {fmt(
              Number(
                amountInput
              )
            )}
          </strong>
        </p>
      )}

      {pendingTopup && (
        <div
          style={{
            marginTop:
              12,
            background:
              "#fff7ed",
            border:
              "1px solid #fed7aa",
            borderRadius:
              12,
            padding:
              12,
          }}
        >
          <p
            style={{
              margin:
                "0 0 5px",
              fontSize:
                12,
              fontWeight:
                900,
              color:
                "#9a3412",
            }}
          >
            Đang xác minh giao
            dịch{" "}
            {fmt(
              pendingTopup.amount
            )}
          </p>

          <p
            style={{
              margin:
                0,
              fontSize:
                11,
              color:
                "#9a3412",
              lineHeight:
                1.5,
            }}
          >
            Nếu bạn đã thanh toán,
            không cần tạo thêm giao
            dịch. Hệ thống đang tự
            động đối soát.
          </p>

          {(reopenUrl ||
            reopenDeeplinkMiniApp) && (
            <button
              type="button"
              onClick={() => {
                void openMomoPayment({
                  deeplinkMiniApp:
                    reopenDeeplinkMiniApp,
                  paymentUrl:
                    reopenUrl,
                });
              }}
              style={{
                display:
                  "inline-block",
                marginTop:
                  8,
                padding:
                  0,
                border:
                  "none",
                background:
                  "transparent",
                color:
                  "#D4531C",
                fontSize:
                  12,
                fontWeight:
                  900,
                cursor:
                  "pointer",
              }}
            >
              Mở lại MoMo
            </button>
          )}
        </div>
      )}

      {notice && (
        <p
          style={{
            margin:
              "10px 0 0",
            color:
              "#0f766e",
            fontSize:
              11,
            lineHeight:
              1.5,
          }}
        >
          {notice}
        </p>
      )}

      {error && (
        <p
          style={{
            margin:
              "10px 0 0",
            color:
              "#dc2626",
            fontSize:
              11,
            lineHeight:
              1.5,
          }}
        >
          {error}
        </p>
      )}

      <div
        style={{
          marginTop:
            18,
          paddingTop:
            14,
          borderTop:
            "1px solid #f3f3f3",
        }}
      >
        <p
          style={{
            margin:
              "0 0 10px",
            fontSize:
              12,
            fontWeight:
              900,
            color:
              "#333",
          }}
        >
          Giao dịch Wallet gần đây
        </p>

        {transactions.length ===
        0 ? (
          <p
            style={{
              margin:
                0,
              fontSize:
                11,
              color:
                "#aaa",
            }}
          >
            Chưa có giao dịch
            Wallet.
          </p>
        ) : (
          transactions
            .slice(0, 8)
            .map(
              (
                transaction,
                index
              ) => {
                const amount =
                  safeMoney(
                    Math.abs(
                      Number(
                        transaction
                          ?.amount ??
                          transaction
                            ?.delta_amount ??
                          transaction
                            ?.balance_change ??
                          0
                      )
                    )
                  );

                const raw =
                  Number(
                    transaction
                      ?.amount ??
                      transaction
                        ?.delta_amount ??
                      transaction
                        ?.balance_change ??
                      0
                  );

                const positive =
                  raw > 0 ||
                  transaction
                    ?.direction ===
                    "credit" ||
                  transaction
                    ?.type ===
                    "credit";

                const label =
                  transaction
                    ?.description ||
                  transaction
                    ?.note ||
                  transaction
                    ?.reason ||
                  transaction
                    ?.transaction_type ||
                  "Giao dịch Cing Wallet";

                const date =
                  transaction
                    ?.created_at ||
                  transaction
                    ?.createdAt;

                return (
                  <div
                    key={
                      transaction
                        ?.id ??
                      index
                    }
                    style={{
                      display:
                        "flex",
                      justifyContent:
                        "space-between",
                      gap:
                        12,
                      padding:
                        "9px 0",
                      borderTop:
                        index > 0
                          ? "1px solid #f7f7f7"
                          : "none",
                    }}
                  >
                    <div
                      style={{
                        minWidth:
                          0,
                      }}
                    >
                      <p
                        style={{
                          margin:
                            0,
                          fontSize:
                            11,
                          fontWeight:
                            700,
                          color:
                            "#333",
                          overflowWrap:
                            "break-word",
                        }}
                      >
                        {label}
                      </p>

                      {date && (
                        <p
                          style={{
                            margin:
                              "2px 0 0",
                            fontSize:
                              10,
                            color:
                              "#aaa",
                          }}
                        >
                          {new Date(
                            date
                          ).toLocaleString(
                            "vi-VN"
                          )}
                        </p>
                      )}
                    </div>

                    <p
                      style={{
                        margin:
                          0,
                        flexShrink:
                          0,
                        fontSize:
                          12,
                        fontWeight:
                          900,
                        color:
                          positive
                            ? "#059669"
                            : "#D4531C",
                      }}
                    >
                      {positive
                        ? "+"
                        : "-"}
                      {fmt(
                        amount
                      )}
                    </p>
                  </div>
                );
              }
            )
        )}
      </div>
    </section>
  );
}

export default memo(
  CustomerWalletList
);
