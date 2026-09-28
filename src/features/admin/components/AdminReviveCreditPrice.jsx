import {
  useCallback,
  useEffect,
  useState,
} from "react";

import apiClient from "@/infra/api/apiClient";

import "./admin-revive-credit-price.css";

/*
 * CING GAME CENTER V2
 * ADMIN REVIVE CREDIT PRICE UI
 *
 * One canonical configured VND price.
 *
 * Points cost = VND / 1000.
 *
 * NULL means purchases disabled.
 *
 * No API calls when frontend feature OFF.
 */

const FEATURE_ENABLED =
  import.meta.env
    .VITE_CING_REVIVE_ADMIN_PRICE_UI_ENABLED === "true";

/*
 * Future release mount:
 *
 * /api/admin/game-economy/revive
 *
 * Backend router is NOT mounted by this UI.
 */

const API_ROOT =
  "/admin/game-economy/revive";

const MAX_POINTS =
  2147483647n;

function validatePrice(value) {
  const text =
    String(value ?? "").trim();

  if (!/^[1-9][0-9]*$/.test(text)) {
    return {
      valid: false,
      points: null,
      error:
        "Giá phải là số nguyên VND dương.",
    };
  }

  const price =
    BigInt(text);

  if (
    price < 1000n ||
    price % 1000n !== 0n ||
    price / 1000n > MAX_POINTS
  ) {
    return {
      valid: false,
      points: null,
      error:
        "Giá tối thiểu 1.000đ, chia hết cho 1.000 và trong giới hạn điểm.",
    };
  }

  return {
    valid: true,

    points:
      (
        price / 1000n
      ).toString(),

    error: "",
  };
}

function makeRequestId() {
  if (
    typeof crypto === "undefined" ||
    typeof crypto.randomUUID !== "function"
  ) {
    throw new Error(
      "Không thể tạo mã yêu cầu cấu hình an toàn."
    );
  }

  return crypto.randomUUID();
}

function normalizeRemote(data) {
  if (
    !data ||
    typeof data !== "object" ||
    typeof data.enabled !== "boolean"
  ) {
    throw new Error(
      "Phản hồi cấu hình Revive Credit không hợp lệ."
    );
  }

  if (data.enabled === false) {
    if (
      data.price_vnd !== null ||
      data.points_cost !== null
    ) {
      throw new Error(
        "Trạng thái tắt bán không khớp giá."
      );
    }

    return {
      enabled: false,
      price: "",
    };
  }

  const price =
    validatePrice(
      data.price_vnd
    );

  if (
    !price.valid ||
    String(data.points_cost) !==
      price.points
  ) {
    throw new Error(
      "Giá Revive Credit từ backend không hợp lệ."
    );
  }

  return {
    enabled: true,

    price:
      String(
        data.price_vnd
      ),
  };
}

export default function AdminReviveCreditPrice({
  token,
  role,
}) {
  const isSuperAdmin =
    role === "super_admin";

  const canUseApi =
    FEATURE_ENABLED &&
    isSuperAdmin &&
    Boolean(token);

  const [enabled, setEnabled] =
    useState(false);

  const [priceVnd, setPriceVnd] =
    useState("");

  const [loaded, setLoaded] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  /*
   * Preserve request ID for retry of an
   * ambiguous network result.
   *
   * Any edit invalidates previous ID.
   */

  const [
    pendingRequest,
    setPendingRequest,
  ] = useState(null);

  const price =
    validatePrice(
      priceVnd
    );

  const load = useCallback(
    async () => {
      if (!canUseApi) {
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response =
          await apiClient.get(
            `${API_ROOT}/price`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        if (
          response.data?.success !==
          true
        ) {
          throw new Error(
            "Không xác minh được cấu hình hiện tại."
          );
        }

        const current =
          normalizeRemote(
            response.data.data
          );

        setEnabled(
          current.enabled
        );

        setPriceVnd(
          current.price
        );

        setLoaded(true);
        setPendingRequest(null);
      } catch (err) {
        setError(
          err.response?.data?.code ||
          err.message ||
          "Không tải được giá Revive Credit."
        );
      } finally {
        setLoading(false);
      }
    },
    [
      canUseApi,
      token,
    ]
  );

  useEffect(() => {
    if (!canUseApi) {
      return;
    }

    load();
  }, [
    canUseApi,
    load,
  ]);

  if (!isSuperAdmin) {
    return null;
  }

  const editPrice = value => {
    setPriceVnd(value);
    setPendingRequest(null);
    setMessage("");
    setError("");
  };

  const editEnabled = value => {
    setEnabled(value);
    setPendingRequest(null);
    setMessage("");
    setError("");
  };

  const save = async () => {
    if (
      !canUseApi ||
      !loaded ||
      saving
    ) {
      return;
    }

    if (
      enabled &&
      !price.valid
    ) {
      setError(
        price.error
      );

      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      /*
       * Explicit NULL is required
       * to disable purchase.
       */

      const configuredPrice =
        enabled
          ? priceVnd.trim()
          : null;

      const requestId =
        pendingRequest ||
        makeRequestId();

      const payload = {
        request_id:
          requestId,

        price_vnd:
          configuredPrice,
      };

      /*
       * Save request identity before
       * the network request starts.
       */

      setPendingRequest(
        requestId
      );

      const response =
        await apiClient.put(
          `${API_ROOT}/price`,
          payload,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const result =
        response.data?.data;

      if (
        response.data?.success !==
          true ||
        result?.request_id !==
          requestId ||
        result?.price_vnd !==
          configuredPrice ||
        result?.enabled !==
          enabled
      ) {
        throw new Error(
          "Chưa xác minh được kết quả lưu giá."
        );
      }

      const normalized =
        normalizeRemote(
          result
        );

      setEnabled(
        normalized.enabled
      );

      setPriceVnd(
        normalized.price
      );

      setPendingRequest(null);

      setMessage(
        result.applied
          ? "Đã lưu giá Revive Credit."
          : "Yêu cầu cấu hình trước đó đã được ghi nhận."
      );
    } catch (err) {
      setError(
        err.response?.data?.code ||
        err.message ||
        "Chưa xác minh được thao tác. Hãy thử lại với cùng nội dung."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="cing-revive-admin">
      <div className="cing-revive-admin-heading">
        <div>
          <p className="cing-revive-admin-eyebrow">
            CING GAME CENTER V2
          </p>

          <h3>
            🫧 Giá Revive Credit
          </h3>

          <p>
            Một giá dùng chung cho Cing Wallet
            và điểm tích lũy.
          </p>
        </div>

        <span className="cing-revive-admin-status">
          {FEATURE_ENABLED
            ? "Chờ xác thực backend"
            : "Chưa kích hoạt"}
        </span>
      </div>

      {!FEATURE_ENABLED && (
        <div className="cing-revive-admin-notice">
          Giao diện đang ở chế độ chuẩn bị.
          Chưa đọc hoặc sửa cấu hình giá
          trên backend.
        </div>
      )}

      <div className="cing-revive-admin-grid">
        <div className="cing-revive-admin-panel">
          <label className="cing-revive-admin-toggle">
            <span>
              <strong>
                Cho phép mua Revive Credit
              </strong>

              <small>
                Tắt bán sẽ ghi giá NULL.
                Giao dịch cũ vẫn được replay.
              </small>
            </span>

            <input
              type="checkbox"
              checked={enabled}
              onChange={event =>
                editEnabled(
                  event.target.checked
                )
              }
              disabled={
                !canUseApi ||
                !loaded ||
                saving
              }
            />
          </label>

          <label className="cing-revive-admin-field">
            <span>
              Giá 1 Revive Credit (VND)
            </span>

            <input
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={priceVnd}
              onChange={event =>
                editPrice(
                  event.target.value
                )
              }
              disabled={
                !canUseApi ||
                !loaded ||
                saving ||
                !enabled
              }
              placeholder="5000"
            />
          </label>

          <p className="cing-revive-admin-hint">
            Giá tối thiểu 1.000đ,
            tăng theo bội số 1.000đ.
          </p>
        </div>

        <div className="cing-revive-admin-panel cing-revive-admin-preview">
          <span>
            Giá thanh toán bằng Wallet
          </span>

          <strong>
            {!enabled
              ? "Tạm ngừng bán"
              : price.valid
                ? `${BigInt(
                    priceVnd
                  ).toLocaleString(
                    "vi-VN"
                  )}đ`
                : "Chưa hợp lệ"}
          </strong>

          <span>
            Giá bằng điểm tích lũy
          </span>

          <strong>
            {!enabled
              ? "Tạm ngừng bán"
              : price.valid
                ? `${price.points} điểm`
                : "Chưa hợp lệ"}
          </strong>

          <small>
            1 điểm = 1.000 VND.
            Không lưu bảng giá điểm riêng.
          </small>
        </div>
      </div>

      {error && (
        <p
          className="cing-revive-admin-feedback error"
          role="alert"
        >
          {error}
        </p>
      )}

      {message && (
        <p
          className="cing-revive-admin-feedback success"
          role="status"
        >
          {message}
        </p>
      )}

      <div className="cing-revive-admin-actions">
        <button
          type="button"
          onClick={load}
          disabled={
            !canUseApi ||
            loading ||
            saving
          }
          className="cing-revive-admin-refresh"
        >
          {loading
            ? "Đang tải..."
            : "Tải lại giá"}
        </button>

        <button
          type="button"
          onClick={save}
          disabled={
            !canUseApi ||
            !loaded ||
            saving ||
            (
              enabled &&
              !price.valid
            )
          }
          className="cing-revive-admin-save"
        >
          {saving
            ? "Đang lưu..."
            : enabled
              ? "Lưu giá Revive Credit"
              : "Xác nhận tắt bán"}
        </button>
      </div>

      <p className="cing-revive-admin-footnote">
        Thay đổi giá không sửa Wallet,
        điểm tích lũy, Revive Credit
        hoặc biên nhận giao dịch trước đó.
      </p>
    </section>
  );
}
