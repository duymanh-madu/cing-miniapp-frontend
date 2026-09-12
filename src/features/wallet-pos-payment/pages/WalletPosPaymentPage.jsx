import {
  useCallback,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  scanCingWalletPosQr,
} from "../runtime/walletPosQrScanner";

import {
  confirmWalletPosPayment,
  previewWalletPosPayment,
} from "../api/walletPosPaymentApi";


const fmtMoney = (
  value
) =>
  `${new Intl.NumberFormat(
    "vi-VN"
  ).format(
    Number(value || 0)
  )}đ`;


function resolveApiError(
  error
) {
  const data =
    error?.response?.data ||
    {};

  const code =
    data?.code ||
    error?.code ||
    "";

  if (
    code ===
    "CING_WALLET_INSUFFICIENT_BALANCE"
  ) {
    return {
      code,
      message:
        "Số dư Cing Wallet không đủ để thanh toán.",
    };
  }

  if (
    code ===
      "CING_WALLET_POS_PAYMENT_EXPIRED" ||
    error?.response?.status ===
      410
  ) {
    return {
      code:
        "CING_WALLET_POS_PAYMENT_EXPIRED",
      message:
        "QR thanh toán đã hết hạn. Vui lòng nhờ thu ngân tạo lại QR.",
    };
  }

  if (
    code ===
    "CING_WALLET_POS_PAYMENT_NOT_FOUND"
  ) {
    return {
      code,
      message:
        "Không tìm thấy giao dịch thanh toán.",
    };
  }

  return {
    code:
      code ||
      "CING_WALLET_POS_PAYMENT_FAILED",

    message:
      data?.message ||
      error?.message ||
      "Không thể xử lý thanh toán Cing Wallet.",
  };
}


export default function
WalletPosPaymentPage() {
  const navigate =
    useNavigate();

  const [
    capability,
    setCapability,
  ] =
    useState("");

  const [
    payment,
    setPayment,
  ] =
    useState(null);

  const [
    scanning,
    setScanning,
  ] =
    useState(false);

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  const [
    confirming,
    setConfirming,
  ] =
    useState(false);

  const [
    result,
    setResult,
  ] =
    useState(null);

  const [
    error,
    setError,
  ] =
    useState(null);

  const scanInFlight =
    useRef(false);

  const confirmInFlight =
    useRef(false);


  const loadPreview =
    useCallback(
      async (
        nextCapability
      ) => {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
          const data =
            await previewWalletPosPayment(
              nextCapability
            );

          if (
            !data ||
            !Number.isSafeInteger(
              Number(
                data.amount
              )
            )
          ) {
            throw new Error(
              "Dữ liệu giao dịch không hợp lệ."
            );
          }

          setCapability(
            nextCapability
          );

          setPayment(
            data
          );
        } catch (
          nextError
        ) {
          setPayment(null);

          setError(
            resolveApiError(
              nextError
            )
          );
        } finally {
          setLoading(false);
        }
      },
      []
    );


  const handleScan =
    useCallback(
      async () => {
        if (
          scanInFlight.current
        ) {
          return;
        }

        scanInFlight.current =
          true;

        setScanning(true);
        setError(null);
        setResult(null);

        try {
          const scanned =
            await scanCingWalletPosQr();

          await loadPreview(
            scanned
          );
        } catch (
          nextError
        ) {
          setPayment(null);

          setError(
            resolveApiError(
              nextError
            )
          );
        } finally {
          setScanning(false);

          scanInFlight.current =
            false;
        }
      },
      [
        loadPreview,
      ]
    );


  const handleConfirm =
    useCallback(
      async () => {
        if (
          !capability ||
          confirmInFlight.current
        ) {
          return;
        }

        confirmInFlight.current =
          true;

        setConfirming(true);
        setError(null);

        try {
          const data =
            await confirmWalletPosPayment(
              capability
            );

          if (
            data?.status !==
            "paid"
          ) {
            throw new Error(
              "Backend chưa xác nhận giao dịch thành công."
            );
          }

          setResult(
            data
          );

          setPayment(
            previous => ({
              ...previous,
              status:
                "paid",
              wallet_balance:
                data.wallet_balance_after,
            })
          );

          window.dispatchEvent(
            new CustomEvent(
              "cing_wallet_balance_updated"
            )
          );
        } catch (
          nextError
        ) {
          setError(
            resolveApiError(
              nextError
            )
          );
        } finally {
          setConfirming(false);

          confirmInFlight.current =
            false;
        }
      },
      [
        capability,
      ]
    );



  const amount =
    Number(
      payment?.amount || 0
    );

  const balance =
    Number(
      payment?.wallet_balance ||
      0
    );

  const sufficient =
    payment?.sufficient_balance ===
      true;

  const shortfall =
    Number(
      payment?.shortfall ||
      Math.max(
        0,
        amount -
        balance
      )
    );


  return (
    <div
      style={{
        minHeight:
          "100vh",
        background:
          "#f7f4ef",
        paddingBottom:
          32,
      }}
    >
      <div
        style={{
          position:
            "sticky",
          top:
            0,
          zIndex:
            20,
          display:
            "flex",
          alignItems:
            "center",
          gap:
            12,
          padding:
            "14px 16px",
          background:
            "rgba(255,255,255,0.96)",
          borderBottom:
            "1px solid #eee7df",
          backdropFilter:
            "blur(14px)",
        }}
      >
        <button
          type="button"
          onClick={() =>
            navigate(-1)
          }
          style={{
            width:
              38,
            height:
              38,
            border:
              "none",
            borderRadius:
              12,
            background:
              "#f5f1ec",
            fontSize:
              20,
            cursor:
              "pointer",
          }}
        >
          ←
        </button>

        <div>
          <h1
            style={{
              margin:
                0,
              fontSize:
                18,
              color:
                "#20170f",
              fontWeight:
                900,
            }}
          >
            Quét QR Cing Wallet
          </h1>

          <p
            style={{
              margin:
                "2px 0 0",
              fontSize:
                11,
              color:
                "#8b7968",
            }}
          >
            Thanh toán hóa đơn tại quầy
          </p>
        </div>
      </div>

      <main
        style={{
          padding:
            16,
          maxWidth:
            520,
          margin:
            "0 auto",
        }}
      >
        {!payment &&
          !result && (
          <section
            style={{
              background:
                "white",
              borderRadius:
                24,
              padding:
                "28px 20px",
              textAlign:
                "center",
              boxShadow:
                "0 8px 28px rgba(76,45,20,0.08)",
            }}
          >
            <div
              style={{
                width:
                  88,
                height:
                  88,
                margin:
                  "0 auto 18px",
                borderRadius:
                  26,
                display:
                  "grid",
                placeItems:
                  "center",
                fontSize:
                  42,
                background:
                  "linear-gradient(135deg,#D4531C,#f59e0b)",
                color:
                  "white",
                boxShadow:
                  "0 12px 28px rgba(212,83,28,0.28)",
              }}
            >
              ▦
            </div>

            <h2
              style={{
                margin:
                  "0 0 8px",
                fontSize:
                  20,
                color:
                  "#21170f",
              }}
            >
              Quét QR trên màn hình POS
            </h2>

            <p
              style={{
                margin:
                  "0 0 22px",
                color:
                  "#786b60",
                fontSize:
                  13,
                lineHeight:
                  1.6,
              }}
            >
              Khi thu ngân chọn Cing Wallet,
              hãy quét mã QR đang hiển thị
              trên màn hình phụ.
            </p>

            <button
              type="button"
              disabled={
                scanning ||
                loading
              }
              onClick={
                handleScan
              }
              style={{
                width:
                  "100%",
                border:
                  "none",
                borderRadius:
                  14,
                padding:
                  "14px 18px",
                background:
                  scanning ||
                  loading
                    ? "#d9d4cf"
                    : "#D4531C",
                color:
                  "white",
                fontSize:
                  14,
                fontWeight:
                  900,
                cursor:
                  scanning ||
                  loading
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              {scanning
                ? "Đang mở camera..."
                : loading
                  ? "Đang kiểm tra hóa đơn..."
                  : "Quét QR thanh toán"}
            </button>
          </section>
        )}

        {payment &&
          !result && (
          <>
            <section
              style={{
                background:
                  "linear-gradient(145deg,#2c1b10,#16100c)",
                color:
                  "white",
                borderRadius:
                  24,
                padding:
                  22,
                boxShadow:
                  "0 12px 34px rgba(30,18,9,0.22)",
                marginBottom:
                  14,
              }}
            >
              <p
                style={{
                  margin:
                    0,
                  opacity:
                    0.65,
                  fontSize:
                    11,
                  textTransform:
                    "uppercase",
                  letterSpacing:
                    1.6,
                  fontWeight:
                    800,
                }}
              >
                Số tiền cần thanh toán
              </p>

              <p
                style={{
                  margin:
                    "8px 0 14px",
                  fontSize:
                    38,
                  lineHeight:
                    1,
                  fontWeight:
                    900,
                }}
              >
                {fmtMoney(
                  amount
                )}
              </p>

              {payment
                .bill_reference && (
                <p
                  style={{
                    margin:
                      0,
                    fontSize:
                      12,
                    opacity:
                      0.72,
                  }}
                >
                  Hóa đơn:{" "}
                  {
                    payment
                      .bill_reference
                  }
                </p>
              )}
            </section>

            <section
              style={{
                background:
                  "white",
                borderRadius:
                  20,
                padding:
                  18,
                boxShadow:
                  "0 4px 18px rgba(76,45,20,0.07)",
                marginBottom:
                  14,
              }}
            >
              <div
                style={{
                  display:
                    "flex",
                  justifyContent:
                    "space-between",
                  alignItems:
                    "center",
                  gap:
                    12,
                }}
              >
                <div>
                  <p
                    style={{
                      margin:
                        "0 0 4px",
                      fontSize:
                        11,
                      color:
                        "#948477",
                    }}
                  >
                    Số dư Cing Wallet
                  </p>

                  <p
                    style={{
                      margin:
                        0,
                      fontSize:
                        23,
                      fontWeight:
                        900,
                      color:
                        "#21170f",
                    }}
                  >
                    {fmtMoney(
                      balance
                    )}
                  </p>
                </div>

                <span
                  style={{
                    borderRadius:
                      999,
                    padding:
                      "7px 11px",
                    fontSize:
                      11,
                    fontWeight:
                      900,
                    background:
                      sufficient
                        ? "#ecfdf5"
                        : "#fff1f2",
                    color:
                      sufficient
                        ? "#047857"
                        : "#be123c",
                  }}
                >
                  {sufficient
                    ? "Đủ số dư"
                    : "Thiếu số dư"}
                </span>
              </div>
            </section>

            {!sufficient ? (
              <section
                style={{
                  background:
                    "#fff7ed",
                  border:
                    "1px solid #fed7aa",
                  borderRadius:
                    18,
                  padding:
                    16,
                }}
              >
                <p
                  style={{
                    margin:
                      "0 0 5px",
                    fontWeight:
                      900,
                    color:
                      "#9a3412",
                    fontSize:
                      14,
                  }}
                >
                  Số dư không đủ
                </p>

                <p
                  style={{
                    margin:
                      "0 0 14px",
                    color:
                      "#9a3412",
                    lineHeight:
                      1.55,
                    fontSize:
                      12,
                  }}
                >
                  Bạn còn thiếu{" "}
                  <strong>
                    {fmtMoney(
                      shortfall
                    )}
                  </strong>
                  . Wallet sẽ không bị trừ
                  tiền khi số dư chưa đủ.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/loyalty"
                    )
                  }
                  style={{
                    width:
                      "100%",
                    border:
                      "none",
                    borderRadius:
                      13,
                    padding:
                      "12px 16px",
                    background:
                      "#D4531C",
                    color:
                      "white",
                    fontWeight:
                      900,
                    cursor:
                      "pointer",
                  }}
                >
                  Nạp thêm vào Cing Wallet
                </button>
              </section>
            ) : (
              <button
                type="button"
                disabled={
                  confirming
                }
                onClick={
                  handleConfirm
                }
                style={{
                  width:
                    "100%",
                  border:
                    "none",
                  borderRadius:
                    16,
                  padding:
                    "15px 18px",
                  background:
                    confirming
                      ? "#d9d4cf"
                      : "#D4531C",
                  color:
                    "white",
                  fontSize:
                    15,
                  fontWeight:
                    900,
                  cursor:
                    confirming
                      ? "not-allowed"
                      : "pointer",
                  boxShadow:
                    confirming
                      ? "none"
                      : "0 9px 22px rgba(212,83,28,0.24)",
                }}
              >
                {confirming
                  ? "Đang thanh toán..."
                  : `Xác nhận thanh toán ${fmtMoney(
                      amount
                    )}`}
              </button>
            )}
          </>
        )}

        {result && (
          <section
            style={{
              background:
                "white",
              borderRadius:
                26,
              padding:
                "32px 20px",
              textAlign:
                "center",
              boxShadow:
                "0 10px 30px rgba(13,92,61,0.12)",
            }}
          >
            <div
              style={{
                width:
                  76,
                height:
                  76,
                margin:
                  "0 auto 16px",
                borderRadius:
                  "50%",
                display:
                  "grid",
                placeItems:
                  "center",
                background:
                  "#ecfdf5",
                color:
                  "#047857",
                fontSize:
                  38,
                fontWeight:
                  900,
              }}
            >
              ✓
            </div>

            <h2
              style={{
                margin:
                  "0 0 8px",
                fontSize:
                  22,
                color:
                  "#143d2d",
              }}
            >
              Thanh toán thành công
            </h2>

            <p
              style={{
                margin:
                  "0 0 6px",
                fontSize:
                  26,
                fontWeight:
                  900,
                color:
                  "#21170f",
              }}
            >
              {fmtMoney(
                result.amount
              )}
            </p>

            <p
              style={{
                margin:
                  "0 0 20px",
                color:
                  "#68756f",
                fontSize:
                  12,
              }}
            >
              Số dư còn lại:{" "}
              <strong>
                {fmtMoney(
                  result
                    .wallet_balance_after
                )}
              </strong>
            </p>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/loyalty",
                  {
                    replace:
                      true,
                  }
                )
              }
              style={{
                width:
                  "100%",
                border:
                  "none",
                borderRadius:
                  14,
                padding:
                  "13px 16px",
                background:
                  "#1d5f46",
                color:
                  "white",
                fontWeight:
                  900,
                cursor:
                  "pointer",
              }}
            >
              Về Cing Wallet
            </button>
          </section>
        )}

        {error && (
          <div
            style={{
              marginTop:
                14,
              padding:
                14,
              borderRadius:
                16,
              background:
                "#fff1f2",
              border:
                "1px solid #fecdd3",
            }}
          >
            <p
              style={{
                margin:
                  "0 0 10px",
                fontSize:
                  12,
                lineHeight:
                  1.5,
                color:
                  "#9f1239",
                fontWeight:
                  700,
              }}
            >
              {error.message}
            </p>

            <button
              type="button"
              onClick={
                handleScan
              }
              disabled={
                scanning ||
                loading
              }
              style={{
                border:
                  "none",
                borderRadius:
                  10,
                padding:
                  "9px 12px",
                background:
                  "#be123c",
                color:
                  "white",
                fontSize:
                  12,
                fontWeight:
                  800,
                cursor:
                  "pointer",
              }}
            >
              Quét lại QR
            </button>
          </div>
        )}

        <p
          style={{
            textAlign:
              "center",
            margin:
              "18px 8px 0",
            fontSize:
              10,
            color:
              "#a2968b",
            lineHeight:
              1.5,
          }}
        >
          Số tiền và trạng thái thanh toán
          được xác nhận trực tiếp bởi
          Cing Wallet Server.
        </p>
      </main>
    </div>
  );
}
