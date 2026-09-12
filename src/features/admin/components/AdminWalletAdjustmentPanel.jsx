import {
  useMemo,
  useState,
} from "react";

import apiClient from "@/infra/api/apiClient";

const moneyFormatter =
  new Intl.NumberFormat("vi-VN");

const REASONS = [
  {
    value:
      "manual_payment_recovery",
    label:
      "Thu hồi / ghi nhận thanh toán thủ công",
  },
  {
    value:
      "customer_compensation",
    label:
      "Bồi hoàn cho khách hàng",
  },
  {
    value:
      "accounting_correction",
    label:
      "Điều chỉnh sai lệch kế toán",
  },
  {
    value:
      "refund_correction",
    label:
      "Điều chỉnh hoàn tiền",
  },
  {
    value:
      "other_authorized_adjustment",
    label:
      "Điều chỉnh được phê duyệt khác",
  },
];

function formatMoney(
  value
) {
  const amount =
    Number(value);

  return Number.isSafeInteger(
    amount
  )
    ? `${moneyFormatter.format(
        amount
      )}đ`
    : "0đ";
}

function createSecureRequestId() {
  const cryptoApi =
    globalThis.crypto;

  if (
    !cryptoApi ||
    typeof cryptoApi.randomUUID !==
      "function"
  ) {
    throw new Error(
      "CING_WALLET_ADMIN_SECURE_UUID_UNAVAILABLE"
    );
  }

  return cryptoApi.randomUUID();
}

function normalizeCustomer(
  row
) {
  const balance =
    Number(
      row?.wallet_balance
    );

  if (
    typeof row?.user_id !==
      "string" ||
    !row.user_id ||
    !Number.isSafeInteger(
      balance
    ) ||
    balance < 0 ||
    typeof row
      ?.wallet_account_exists !==
      "boolean"
  ) {
    throw new Error(
      "CING_WALLET_ADMIN_CUSTOMER_PROJECTION_INVALID"
    );
  }

  return {
    user_id:
      row.user_id,
    phone:
      typeof row?.phone ===
        "string"
        ? row.phone
        : row.user_id,
    display_name:
      typeof row
        ?.display_name ===
        "string" &&
      row.display_name
        ? row.display_name
        : row.user_id,
    avatar:
      typeof row?.avatar ===
        "string"
        ? row.avatar
        : "",
    wallet_balance:
      balance,
    wallet_status:
      typeof row
        ?.wallet_status ===
        "string"
        ? row.wallet_status
        : "not_created",
    wallet_account_exists:
      row
        .wallet_account_exists,
  };
}

function normalizeLookupResponse(
  response
) {
  const items =
    response
      ?.data
      ?.data
      ?.items;

  if (!Array.isArray(items)) {
    throw new Error(
      "CING_WALLET_ADMIN_CUSTOMER_PROJECTION_INVALID"
    );
  }

  return items.map(
    normalizeCustomer
  );
}

function adjustmentErrorMessage(
  error
) {
  const code =
    error
      ?.response
      ?.data
      ?.error ||
    error?.message ||
    "";

  const labels = {
    CING_WALLET_INSUFFICIENT_BALANCE:
      "Số dư Wallet không đủ để thực hiện khoản trừ này.",
    CING_WALLET_ADMIN_ADJUSTMENT_REPLAY_CONFLICT:
      "Request ID này đã được dùng với nội dung khác. Thao tác đã bị chặn.",
    CING_WALLET_SUPER_ADMIN_REQUIRED:
      "Tài khoản hiện tại không có quyền Super Admin.",
    CING_WALLET_ADMIN_CUSTOMER_QUERY_INVALID:
      "Từ khóa tìm khách hàng không hợp lệ.",
    CING_WALLET_ADMIN_SECURE_UUID_UNAVAILABLE:
      "Trình duyệt không hỗ trợ UUID bảo mật. Không thể tạo giao dịch.",
    CING_WALLET_ADMIN_CUSTOMER_PROJECTION_INVALID:
      "Dữ liệu Wallet của khách hàng không hợp lệ.",
  };

  return (
    labels[code] ||
    code ||
    "Không thể hoàn tất thao tác Wallet."
  );
}

export default function AdminWalletAdjustmentPanel({
  token,
  role,
  onAdjusted,
}) {
  const headers =
    useMemo(
      () => ({
        Authorization:
          `Bearer ${token}`,
      }),
      [token]
    );

  const [
    query,
    setQuery,
  ] =
    useState("");

  const [
    customers,
    setCustomers,
  ] =
    useState([]);

  const [
    selectedCustomer,
    setSelectedCustomer,
  ] =
    useState(null);

  const [
    searching,
    setSearching,
  ] =
    useState(false);

  const [
    direction,
    setDirection,
  ] =
    useState("debit");

  const [
    amount,
    setAmount,
  ] =
    useState("");

  const [
    reasonCode,
    setReasonCode,
  ] =
    useState(
      "manual_payment_recovery"
    );

  const [
    note,
    setNote,
  ] =
    useState("");

  const [
    referenceType,
    setReferenceType,
  ] =
    useState("");

  const [
    referenceId,
    setReferenceId,
  ] =
    useState("");

  const [
    requestId,
    setRequestId,
  ] =
    useState(null);

  const [
    confirmation,
    setConfirmation,
  ] =
    useState(null);

  const [
    submitting,
    setSubmitting,
  ] =
    useState(false);

  const [
    message,
    setMessage,
  ] =
    useState("");

  const [
    messageType,
    setMessageType,
  ] =
    useState("");

  const [
    lastResult,
    setLastResult,
  ] =
    useState(null);

  if (
    String(
      role || ""
    ).toLowerCase() !==
      "super_admin"
  ) {
    return null;
  }

  const invalidateIntent =
    () => {
      setRequestId(null);
      setConfirmation(null);
      setLastResult(null);
      setMessage("");
      setMessageType("");
    };

  const resetAdjustment =
    () => {
      setDirection("debit");
      setAmount("");
      setReasonCode(
        "manual_payment_recovery"
      );
      setNote("");
      setReferenceType("");
      setReferenceId("");
      setRequestId(null);
      setConfirmation(null);
      setSubmitting(false);
    };

  const searchCustomers =
    async (
      explicitQuery =
        query
    ) => {
      const normalized =
        String(
          explicitQuery || ""
        ).trim();

      if (
        normalized.length < 2
      ) {
        setMessage(
          "Nhập ít nhất 2 ký tự, số điện thoại hoặc User ID."
        );
        setMessageType(
          "error"
        );
        return;
      }

      setSearching(true);
      setMessage("");
      setMessageType("");

      try {
        const response =
          await apiClient.get(
            "/admin/wallet/customers",
            {
              headers,
              params: {
                q:
                  normalized,
              },
            }
          );

        const items =
          normalizeLookupResponse(
            response
          );

        setCustomers(
          items
        );

        if (
          items.length === 0
        ) {
          setMessage(
            "Không tìm thấy khách hàng phù hợp."
          );
          setMessageType(
            "error"
          );
        }
      } catch (
        searchError
      ) {
        setCustomers([]);
        setMessage(
          adjustmentErrorMessage(
            searchError
          )
        );
        setMessageType(
          "error"
        );
      } finally {
        setSearching(false);
      }
    };

  const selectCustomer =
    customer => {
      setSelectedCustomer(
        customer
      );
      setCustomers([]);
      setQuery(
        customer.phone ||
        customer.user_id
      );
      resetAdjustment();
      setMessage("");
      setMessageType("");
      setLastResult(null);
    };

  const refreshSelectedCustomer =
    async (
      userId
    ) => {
      const response =
        await apiClient.get(
          "/admin/wallet/customers",
          {
            headers,
            params: {
              q:
                userId,
            },
          }
        );

      const items =
        normalizeLookupResponse(
          response
        );

      const exact =
        items.find(
          item =>
            item.user_id ===
            userId
        );

      if (!exact) {
        throw new Error(
          "CING_WALLET_ADMIN_CUSTOMER_PROJECTION_INVALID"
        );
      }

      setSelectedCustomer(
        exact
      );

      return exact;
    };

  const validateIntent =
    () => {
      if (
        !selectedCustomer
      ) {
        return "Chưa chọn khách hàng.";
      }

      const parsedAmount =
        Number(amount);

      if (
        !Number.isSafeInteger(
          parsedAmount
        ) ||
        parsedAmount <= 0
      ) {
        return "Số tiền phải là số nguyên dương.";
      }

      if (
        direction !==
          "credit" &&
        direction !==
          "debit"
      ) {
        return "Chiều điều chỉnh không hợp lệ.";
      }

      if (
        direction ===
          "debit" &&
        parsedAmount >
          selectedCustomer
            .wallet_balance
      ) {
        return "Số tiền trừ đang lớn hơn số dư Wallet hiện tại.";
      }

      if (
        !REASONS.some(
          item =>
            item.value ===
            reasonCode
        )
      ) {
        return "Lý do điều chỉnh không hợp lệ.";
      }

      if (
        !note.trim()
      ) {
        return "Ghi chú bắt buộc để tạo audit trail.";
      }

      if (
        note.trim().length >
          500
      ) {
        return "Ghi chú quá dài.";
      }

      const hasReferenceType =
        Boolean(
          referenceType.trim()
        );

      const hasReferenceId =
        Boolean(
          referenceId.trim()
        );

      if (
        hasReferenceType !==
        hasReferenceId
      ) {
        return "Reference Type và Reference ID phải được nhập cùng nhau.";
      }

      return null;
    };

  const openConfirmation =
    () => {
      const validationError =
        validateIntent();

      if (
        validationError
      ) {
        setMessage(
          validationError
        );
        setMessageType(
          "error"
        );
        return;
      }

      let stableRequestId =
        requestId;

      try {
        if (
          !stableRequestId
        ) {
          stableRequestId =
            createSecureRequestId();

          setRequestId(
            stableRequestId
          );
        }
      } catch (
        uuidError
      ) {
        setMessage(
          adjustmentErrorMessage(
            uuidError
          )
        );
        setMessageType(
          "error"
        );
        return;
      }

      const parsedAmount =
        Number(amount);

      setConfirmation({
        user_id:
          selectedCustomer
            .user_id,
        display_name:
          selectedCustomer
            .display_name,
        phone:
          selectedCustomer
            .phone,
        balance_before:
          selectedCustomer
            .wallet_balance,
        direction,
        amount:
          parsedAmount,
        balance_preview:
          direction ===
            "credit"
            ? selectedCustomer
                .wallet_balance +
              parsedAmount
            : selectedCustomer
                .wallet_balance -
              parsedAmount,
        reason_code:
          reasonCode,
        note:
          note.trim(),
        reference_type:
          referenceType.trim(),
        reference_id:
          referenceId.trim(),
        request_id:
          stableRequestId,
      });

      setMessage("");
      setMessageType("");
    };

  const submitAdjustment =
    async () => {
      if (
        !confirmation ||
        submitting
      ) {
        return;
      }

      setSubmitting(true);
      setMessage("");
      setMessageType("");

      try {
        const payload = {
          user_id:
            confirmation
              .user_id,
          direction:
            confirmation
              .direction,
          amount:
            confirmation
              .amount,
          request_id:
            confirmation
              .request_id,
          reason_code:
            confirmation
              .reason_code,
          note:
            confirmation
              .note,
        };

        if (
          confirmation
            .reference_type &&
          confirmation
            .reference_id
        ) {
          payload.reference_type =
            confirmation
              .reference_type;

          payload.reference_id =
            confirmation
              .reference_id;
        }

        const response =
          await apiClient.post(
            "/admin/wallet/adjustments",
            payload,
            {
              headers,
            }
          );

        const row =
          response
            ?.data
            ?.data;

        if (
          !row ||
          typeof row
            .transaction_id !==
            "string" ||
          !row.transaction_id ||
          typeof row
            .user_id !==
            "string" ||
          !Number.isSafeInteger(
            Number(
              row.balance_before
            )
          ) ||
          !Number.isSafeInteger(
            Number(
              row.balance_after
            )
          )
        ) {
          throw new Error(
            "CING_WALLET_ADMIN_ADJUSTMENT_RESULT_INVALID"
          );
        }

        const normalizedResult = {
          ...row,
          balance_before:
            Number(
              row.balance_before
            ),
          balance_after:
            Number(
              row.balance_after
            ),
          amount:
            Number(
              row.amount
            ),
          signed_amount:
            Number(
              row.signed_amount
            ),
          applied:
            row.applied ===
            true,
        };

        setLastResult(
          normalizedResult
        );

        await refreshSelectedCustomer(
          confirmation
            .user_id
        );

        if (
          typeof onAdjusted ===
            "function"
        ) {
          onAdjusted(
            normalizedResult
          );
        }

        setMessage(
          normalizedResult
            .applied
            ? "Điều chỉnh Wallet đã được ghi nhận thành công."
            : "Request này đã được xử lý trước đó. Không tạo giao dịch thứ hai."
        );

        setMessageType(
          "success"
        );

        resetAdjustment();
      } catch (
        submitError
      ) {
        setMessage(
          adjustmentErrorMessage(
            submitError
          )
        );

        setMessageType(
          "error"
        );

        /*
         * Keep confirmation + request_id intact.
         * Exact retry MUST reuse the same financial intent UUID.
         */
      } finally {
        setSubmitting(false);
      }
    };

  const parsedAmount =
    Number(amount);

  const previewBalance =
    selectedCustomer &&
    Number.isSafeInteger(
      parsedAmount
    ) &&
    parsedAmount > 0
      ? direction ===
          "credit"
        ? selectedCustomer
            .wallet_balance +
          parsedAmount
        : selectedCustomer
            .wallet_balance -
          parsedAmount
      : null;

  const reasonLabel =
    REASONS.find(
      item =>
        item.value ===
        reasonCode
    )?.label ||
    reasonCode;

  return (
    <section className="admin-wallet__section admin-wallet__adjustment">
      <div className="admin-wallet__section-head">
        <div>
          <p>SUPER ADMIN FINANCIAL AUTHORITY</p>
          <h2>Điều chỉnh số dư Wallet</h2>
        </div>

        <div className="admin-wallet__adjustment-lock">
          🔐 Super Admin only
        </div>
      </div>

      <div className="admin-wallet__adjustment-warning">
        Đây là thao tác tài chính thật. Mọi thay đổi được ghi vào ledger bất biến và không thể sửa hoặc xoá. Nếu thao tác sai, phải tạo một giao dịch đảo chiều mới.
      </div>

      {message && (
        <div
          className={`admin-wallet__notice ${
            messageType ===
              "success"
              ? "is-success"
              : "is-error"
          }`}
        >
          {message}
        </div>
      )}

      <div className="admin-wallet__customer-search">
        <label>
          <span>
            Tìm khách hàng
          </span>

          <input
            type="text"
            value={query}
            placeholder="Số điện thoại, User ID hoặc tên"
            onChange={event => {
              setQuery(
                event.target
                  .value
              );
            }}
            onKeyDown={event => {
              if (
                event.key ===
                "Enter"
              ) {
                searchCustomers();
              }
            }}
          />
        </label>

        <button
          type="button"
          disabled={
            searching
          }
          onClick={() =>
            searchCustomers()
          }
        >
          {searching
            ? "Đang tìm..."
            : "Tìm khách"}
        </button>
      </div>

      {customers.length >
        0 && (
        <div className="admin-wallet__customer-results">
          {customers.map(
            customer => (
              <button
                type="button"
                key={
                  customer
                    .user_id
                }
                onClick={() =>
                  selectCustomer(
                    customer
                  )
                }
              >
                <span className="admin-wallet__customer-result-identity">
                  {customer
                    .avatar ? (
                    <img
                      src={
                        customer
                          .avatar
                      }
                      alt=""
                    />
                  ) : (
                    <span className="admin-wallet__customer-avatar-fallback">
                      👤
                    </span>
                  )}

                  <span>
                    <strong>
                      {
                        customer
                          .display_name
                      }
                    </strong>

                    <small>
                      {
                        customer
                          .phone
                      }{" "}
                      ·{" "}
                      {
                        customer
                          .user_id
                      }
                    </small>
                  </span>
                </span>

                <strong className="admin-wallet__customer-result-balance">
                  {formatMoney(
                    customer
                      .wallet_balance
                  )}
                </strong>
              </button>
            )
          )}
        </div>
      )}

      {selectedCustomer && (
        <>
          <div className="admin-wallet__selected-customer">
            <div className="admin-wallet__selected-customer-main">
              {selectedCustomer
                .avatar ? (
                <img
                  src={
                    selectedCustomer
                      .avatar
                  }
                  alt=""
                />
              ) : (
                <div className="admin-wallet__selected-avatar-fallback">
                  👤
                </div>
              )}

              <div>
                <span>
                  KHÁCH HÀNG ĐANG CHỌN
                </span>

                <strong>
                  {
                    selectedCustomer
                      .display_name
                  }
                </strong>

                <small>
                  {
                    selectedCustomer
                      .phone
                  }{" "}
                  ·{" "}
                  {
                    selectedCustomer
                      .user_id
                  }
                </small>
              </div>
            </div>

            <div className="admin-wallet__selected-balance">
              <span>
                SỐ DƯ CANONICAL
              </span>

              <strong>
                {formatMoney(
                  selectedCustomer
                    .wallet_balance
                )}
              </strong>

              <small>
                {
                  selectedCustomer
                    .wallet_account_exists
                    ? selectedCustomer
                        .wallet_status
                    : "Chưa tạo Wallet"
                }
              </small>
            </div>
          </div>

          <div className="admin-wallet__adjustment-direction">
            <button
              type="button"
              className={
                direction ===
                  "credit"
                  ? "is-active is-credit"
                  : ""
              }
              onClick={() => {
                invalidateIntent();
                setDirection(
                  "credit"
                );
              }}
            >
              <span>＋</span>
              Cộng tiền
            </button>

            <button
              type="button"
              className={
                direction ===
                  "debit"
                  ? "is-active is-debit"
                  : ""
              }
              onClick={() => {
                invalidateIntent();
                setDirection(
                  "debit"
                );
              }}
            >
              <span>−</span>
              Trừ tiền
            </button>
          </div>

          <div className="admin-wallet__adjustment-grid">
            <label>
              <span>
                Số tiền (VND) *
              </span>

              <input
                inputMode="numeric"
                value={amount}
                placeholder="Ví dụ: 150000"
                onChange={event => {
                  invalidateIntent();

                  setAmount(
                    event.target
                      .value
                      .replace(
                        /\D/g,
                        ""
                      )
                  );
                }}
              />
            </label>

            <label>
              <span>
                Lý do *
              </span>

              <select
                value={
                  reasonCode
                }
                onChange={event => {
                  invalidateIntent();

                  setReasonCode(
                    event.target
                      .value
                  );
                }}
              >
                {REASONS.map(
                  reason => (
                    <option
                      key={
                        reason.value
                      }
                      value={
                        reason.value
                      }
                    >
                      {
                        reason.label
                      }
                    </option>
                  )
                )}
              </select>
            </label>

            <label className="is-wide">
              <span>
                Ghi chú audit *
              </span>

              <textarea
                value={note}
                maxLength={500}
                placeholder="Mô tả rõ nguyên nhân, người/phòng ban xác nhận hoặc tình huống cần xử lý..."
                onChange={event => {
                  invalidateIntent();

                  setNote(
                    event.target
                      .value
                  );
                }}
              />

              <small className="admin-wallet__field-hint">
                {note.length}/500
              </small>
            </label>

            <label>
              <span>
                Reference Type
              </span>

              <input
                type="text"
                value={
                  referenceType
                }
                placeholder="Ví dụ: ipos_bill"
                onChange={event => {
                  invalidateIntent();

                  setReferenceType(
                    event.target
                      .value
                  );
                }}
              />
            </label>

            <label>
              <span>
                Reference ID
              </span>

              <input
                type="text"
                value={
                  referenceId
                }
                placeholder="Mã đơn / ticket / phiếu"
                onChange={event => {
                  invalidateIntent();

                  setReferenceId(
                    event.target
                      .value
                  );
                }}
              />
            </label>
          </div>

          <div className="admin-wallet__adjustment-preview">
            <div>
              <span>
                Số dư hiện tại
              </span>
              <strong>
                {formatMoney(
                  selectedCustomer
                    .wallet_balance
                )}
              </strong>
            </div>

            <div>
              <span>
                Điều chỉnh
              </span>
              <strong
                className={
                  direction ===
                    "credit"
                    ? "is-credit"
                    : "is-debit"
                }
              >
                {direction ===
                  "credit"
                  ? "+"
                  : "-"}
                {Number.isSafeInteger(
                  parsedAmount
                ) &&
                parsedAmount > 0
                  ? formatMoney(
                      parsedAmount
                    )
                  : "0đ"}
              </strong>
            </div>

            <div>
              <span>
                Số dư dự kiến
              </span>
              <strong>
                {previewBalance !==
                  null
                  ? formatMoney(
                      previewBalance
                    )
                  : "—"}
              </strong>
            </div>
          </div>

          <div className="admin-wallet__adjustment-submit-row">
            <div>
              <strong>
                {reasonLabel}
              </strong>

              <small>
                Backend/PostgreSQL quyết định kết quả cuối cùng. UI không tự cộng trừ số dư.
              </small>
            </div>

            <button
              type="button"
              onClick={
                openConfirmation
              }
              disabled={
                submitting
              }
            >
              Kiểm tra & xác nhận
            </button>
          </div>
        </>
      )}

      {lastResult && (
        <div className="admin-wallet__adjustment-result">
          <strong>
            Giao dịch gần nhất
          </strong>

          <span>
            Transaction:{" "}
            {
              lastResult
                .transaction_id
            }
          </span>

          <span>
            Số dư:{" "}
            {formatMoney(
              lastResult
                .balance_before
            )}{" "}
            →{" "}
            {formatMoney(
              lastResult
                .balance_after
            )}
          </span>
        </div>
      )}

      {confirmation && (
        <div
          className="admin-wallet__confirm-backdrop"
          role="presentation"
        >
          <div
            className="admin-wallet__confirm-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="wallet-adjust-confirm-title"
          >
            <div className="admin-wallet__confirm-danger">
              XÁC NHẬN GIAO DỊCH TÀI CHÍNH
            </div>

            <h3 id="wallet-adjust-confirm-title">
              {confirmation
                .direction ===
                "credit"
                ? "Cộng"
                : "Trừ"}{" "}
              {formatMoney(
                confirmation
                  .amount
              )}
            </h3>

            <div className="admin-wallet__confirm-customer">
              <strong>
                {
                  confirmation
                    .display_name
                }
              </strong>

              <span>
                {
                  confirmation
                    .phone
                }{" "}
                ·{" "}
                {
                  confirmation
                    .user_id
                }
              </span>
            </div>

            <div className="admin-wallet__confirm-balance">
              <div>
                <span>
                  Trước
                </span>

                <strong>
                  {formatMoney(
                    confirmation
                      .balance_before
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Sau dự kiến
                </span>

                <strong>
                  {formatMoney(
                    confirmation
                      .balance_preview
                  )}
                </strong>
              </div>
            </div>

            <dl className="admin-wallet__confirm-details">
              <div>
                <dt>
                  Lý do
                </dt>
                <dd>
                  {
                    confirmation
                      .reason_code
                  }
                </dd>
              </div>

              <div>
                <dt>
                  Ghi chú
                </dt>
                <dd>
                  {
                    confirmation
                      .note
                  }
                </dd>
              </div>

              <div>
                <dt>
                  Reference
                </dt>
                <dd>
                  {confirmation
                    .reference_type
                    ? `${confirmation.reference_type} / ${confirmation.reference_id}`
                    : "—"}
                </dd>
              </div>

              <div>
                <dt>
                  Request ID
                </dt>
                <dd>
                  {
                    confirmation
                      .request_id
                  }
                </dd>
              </div>
            </dl>

            <div className="admin-wallet__confirm-warning">
              Nhấn xác nhận sẽ gửi request thật tới financial authority. Nếu mạng lỗi, retry giữ nguyên Request ID để chống double-credit/debit.
            </div>

            <div className="admin-wallet__confirm-actions">
              <button
                type="button"
                disabled={
                  submitting
                }
                onClick={() =>
                  setConfirmation(
                    null
                  )
                }
              >
                Quay lại
              </button>

              <button
                type="button"
                className={
                  confirmation
                    .direction ===
                    "credit"
                    ? "is-credit"
                    : "is-debit"
                }
                disabled={
                  submitting
                }
                onClick={
                  submitAdjustment
                }
              >
                {submitting
                  ? "Đang xử lý..."
                  : "Xác nhận giao dịch"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
