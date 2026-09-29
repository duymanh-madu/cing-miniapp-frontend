import {
  useCallback,
  useEffect,
  useState,
} from "react";

import apiClient from "@/infra/api/apiClient";

import "./admin-game-gift-catalog.css";

/*
 * CING GAME CENTER V2
 * ADMIN GIFT CATALOG UI
 *
 * This feature is deliberately OFF by default.
 *
 * No request, catalog seed or financial mutation
 * happens while the frontend flag is OFF.
 *
 * Backend route and PostgreSQL RPC have separate
 * activation gates.
 */

const FEATURE_ENABLED =
  import.meta.env
    .VITE_CING_GAME_GIFT_ADMIN_UI_ENABLED === "true";

/*
 * Future release mount contract:
 *
 * /api/admin/game-economy/gifts
 *
 * Do not mount backend routes in this block.
 */

const API_ROOT =
  "/admin/game-economy/gifts";

const MAX_POINTS =
  2147483647n;

function blankDraft() {
  return {
    id: "",
    name: "",
    icon: "",
    price_vnd: "",
    charm_award: "",
    enabled: false,
  };
}

function normalizeDraft(row) {
  return {
    id:
      String(row?.id || ""),

    name:
      String(row?.name || ""),

    icon:
      String(row?.icon || ""),

    price_vnd:
      String(
        row?.price_vnd ?? ""
      ),

    charm_award:
      String(
        row?.charm_award ?? ""
      ),

    enabled:
      row?.enabled === true,
  };
}

function pricePolicy(value) {
  const raw =
    String(value ?? "").trim();

  if (!/^[1-9][0-9]*$/.test(raw)) {
    return {
      valid: false,
      points: null,
      error:
        "Giá phải là số nguyên VND dương.",
    };
  }

  const price =
    BigInt(raw);

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

function validateDraft(draft) {
  if (
    !/^[a-z0-9][a-z0-9_-]{0,63}$/.test(
      draft.id
    )
  ) {
    return "Mã Gift phải dùng chữ thường, số, _ hoặc -.";
  }

  if (
    !draft.name.trim() ||
    draft.name.trim().length > 120
  ) {
    return "Tên Gift phải từ 1 đến 120 ký tự.";
  }

  if (
    !draft.icon.trim() ||
    draft.icon.trim().length > 64
  ) {
    return "Biểu tượng Gift không hợp lệ.";
  }

  const price =
    pricePolicy(
      draft.price_vnd
    );

  if (!price.valid) {
    return price.error;
  }

  if (
    !/^[1-9][0-9]*$/.test(
      draft.charm_award
    )
  ) {
    return "Điểm quyến rũ phải là số nguyên dương.";
  }

  const charm =
    BigInt(
      draft.charm_award
    );

  if (
    charm > MAX_POINTS
  ) {
    return "Điểm quyến rũ vượt giới hạn cho phép.";
  }

  return "";
}

function newRequestId() {
  if (
    typeof crypto === "undefined" ||
    typeof crypto.randomUUID !==
      "function"
  ) {
    throw new Error(
      "Trình duyệt chưa hỗ trợ tạo mã giao dịch an toàn."
    );
  }

  return crypto.randomUUID();
}

function Field({
  label,
  value,
  onChange,
  disabled,
  type = "text",
  placeholder = "",
}) {
  return (
    <label className="cing-gift-admin-field">
      <span>{label}</span>

      <input
        type={type}
        value={value}
        onChange={e =>
          onChange(
            e.target.value
          )
        }
        disabled={disabled}
        placeholder={placeholder}
        autoComplete="off"
      />
    </label>
  );
}

export default function AdminGameGiftCatalog({
  token,
  role,
}) {
  const isSuperAdmin =
    role === "super_admin";

  const [rows, setRows] =
    useState([]);

  const [draft, setDraft] =
    useState(blankDraft);

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  /*
   * Preserve request ID after an ambiguous
   * network failure. Editing the payload
   * invalidates that ID.
   */
  const [
    pendingRequest,
    setPendingRequest,
  ] = useState(null);

  const price =
    pricePolicy(
      draft.price_vnd
    );

  const canUseApi =
    isSuperAdmin &&
    FEATURE_ENABLED &&
    Boolean(token);

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
            `${API_ROOT}/catalog`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          response.data?.data;

        if (!Array.isArray(data)) {
          throw new Error(
            "Danh mục Gift trả về không hợp lệ."
          );
        }

        setRows(data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
          err.response?.data?.code ||
          err.message ||
          "Không tải được danh mục Gift."
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

  const edit = (key, value) => {
    setDraft(
      current => ({
        ...current,
        [key]: value,
      })
    );

    setPendingRequest(null);
    setMessage("");
    setError("");
  };

  const selectGift = row => {
    setDraft(
      normalizeDraft(row)
    );

    setPendingRequest(null);
    setMessage("");
    setError("");
  };

  const reset = () => {
    setDraft(
      blankDraft()
    );

    setPendingRequest(null);
    setMessage("");
    setError("");
  };

  const save = async () => {
    if (
      !canUseApi ||
      saving
    ) {
      return;
    }

    const invalid =
      validateDraft(draft);

    if (invalid) {
      setError(invalid);
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        request_id:
          pendingRequest ||
          newRequestId(),

        name:
          draft.name.trim(),

        icon:
          draft.icon.trim(),

        price_vnd:
          draft.price_vnd,

        charm_award:
          Number(
            draft.charm_award
          ),

        enabled:
          draft.enabled,
      };

      /*
       * Save the request ID before network I/O.
       * A retry of the SAME payload reuses it.
       */
      setPendingRequest(
        payload.request_id
      );

      const response =
        await apiClient.put(
          `${API_ROOT}/catalog/${encodeURIComponent(
            draft.id
          )}`,
          payload,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      if (
        response.data?.success !==
          true ||
        response.data?.data?.catalog?.id !==
          draft.id
      ) {
        throw new Error(
          "Chưa xác minh được kết quả lưu Gift."
        );
      }

      setMessage(
        response.data.data.applied
          ? "Đã lưu Gift Catalog."
          : "Yêu cầu trước đó đã được ghi nhận."
      );

      setPendingRequest(null);

      await load();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.code ||
        err.message ||
        "Chưa xác minh được giao dịch cấu hình. Hãy thử lại, không đổi nội dung."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="cing-gift-admin">
      <div className="cing-gift-admin-heading">
        <div>
          <p className="cing-gift-admin-eyebrow">
            CING GAME CENTER V2
          </p>

          <h3>
            🎁 Gift Catalog
          </h3>

          <p>
            Quản lý vật phẩm tặng,
            giá VND, điểm quy đổi và Điểm quyến rũ.
          </p>
        </div>

        <span
          className={
            FEATURE_ENABLED
              ? "cing-gift-admin-status is-enabled"
              : "cing-gift-admin-status"
          }
        >
          {FEATURE_ENABLED
            ? "Chờ xác thực backend"
            : "Chưa kích hoạt"}
        </span>
      </div>

      {!FEATURE_ENABLED && (
        <div className="cing-gift-admin-notice">
          Giao diện đã được tích hợp.
          Chức năng đọc và lưu Gift chưa được
          kích hoạt; không có API hoặc giao dịch
          tài chính nào được gọi từ bảng này.
        </div>
      )}

      <div className="cing-gift-admin-layout">
        <div className="cing-gift-admin-panel">
          <div className="cing-gift-admin-panel-title">
            <strong>Danh mục vật phẩm</strong>

            <button
              type="button"
              onClick={load}
              disabled={
                !canUseApi ||
                loading
              }
            >
              {loading
                ? "Đang tải..."
                : "Làm mới"}
            </button>
          </div>

          {!FEATURE_ENABLED ? (
            <p className="cing-gift-admin-empty">
              Chưa tải danh mục vì feature gate
              đang OFF. Không sử dụng dữ liệu Gift
              legacy làm dữ liệu giả.
            </p>
          ) : rows.length === 0 ? (
            <p className="cing-gift-admin-empty">
              {loading
                ? "Đang tải danh mục..."
                : "Chưa có vật phẩm hoặc chưa tải được dữ liệu."}
            </p>
          ) : (
            <div className="cing-gift-admin-items">
              {rows.map(row => (
                <button
                  key={row.id}
                  type="button"
                  className="cing-gift-admin-item"
                  onClick={() =>
                    selectGift(row)
                  }
                  disabled={saving}
                >
                  <span className="cing-gift-admin-icon">
                    {row.icon}
                  </span>

                  <span className="cing-gift-admin-item-main">
                    <strong>
                      {row.name}
                    </strong>

                    <small>
                      {row.id}
                    </small>

                    <small>
                      {Number(
                        row.price_vnd
                      ).toLocaleString(
                        "vi-VN"
                      )}đ · {row.points_cost} điểm
                    </small>
                  </span>

                  <span
                    className={
                      row.enabled
                        ? "cing-gift-admin-pill on"
                        : "cing-gift-admin-pill"
                    }
                  >
                    {row.enabled
                      ? "Mở bán"
                      : "Tạm dừng"}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="cing-gift-admin-panel">
          <div className="cing-gift-admin-panel-title">
            <strong>
              Cấu hình Gift
            </strong>

            <button
              type="button"
              onClick={reset}
              disabled={saving}
            >
              Gift mới
            </button>
          </div>

          <div className="cing-gift-admin-form">
            <Field
              label="Mã vật phẩm"
              value={draft.id}
              onChange={value =>
                edit(
                  "id",
                  value
                )
              }
              disabled={
                saving ||
                rows.some(
                  row =>
                    row.id === draft.id
                )
              }
              placeholder="cafe_nau"
            />

            <Field
              label="Tên vật phẩm"
              value={draft.name}
              onChange={value =>
                edit(
                  "name",
                  value
                )
              }
              disabled={saving}
              placeholder="Cà phê nâu"
            />

            <Field
              label="Biểu tượng"
              value={draft.icon}
              onChange={value =>
                edit(
                  "icon",
                  value
                )
              }
              disabled={saving}
              placeholder="☕"
            />

            <div className="cing-gift-admin-two">
              <Field
                label="Giá VND"
                value={draft.price_vnd}
                onChange={value =>
                  edit(
                    "price_vnd",
                    value
                  )
                }
                disabled={saving}
                placeholder="5000"
              />

              <Field
                label="Điểm quyến rũ thưởng"
                value={draft.charm_award}
                onChange={value =>
                  edit(
                    "charm_award",
                    value
                  )
                }
                disabled={saving}
                placeholder="5"
              />
            </div>

            <div className="cing-gift-admin-price">
              <span>Giá bằng điểm tích lũy</span>

              <strong>
                {price.valid
                  ? `${price.points} điểm`
                  : "Chưa hợp lệ"}
              </strong>

              <small>
                Quy đổi cố định:
                1 điểm = 1.000 VND.
              </small>
            </div>

            <label className="cing-gift-admin-toggle">
              <span>
                <strong>Mở bán vật phẩm</strong>

                <small>
                  Tắt để ngừng giao dịch mới.
                  Lịch sử mua không bị sửa.
                </small>
              </span>

              <input
                type="checkbox"
                checked={draft.enabled}
                onChange={e =>
                  edit(
                    "enabled",
                    e.target.checked
                  )
                }
                disabled={saving}
              />
            </label>

            {error && (
              <p
                className="cing-gift-admin-feedback error"
                role="alert"
              >
                {error}
              </p>
            )}

            {message && (
              <p
                className="cing-gift-admin-feedback success"
                role="status"
              >
                {message}
              </p>
            )}

            <button
              type="button"
              className="cing-gift-admin-save"
              onClick={save}
              disabled={
                !canUseApi ||
                saving
              }
            >
              {saving
                ? "Đang lưu..."
                : "Lưu cấu hình Gift"}
            </button>

            <p className="cing-gift-admin-footnote">
              Giá và Điểm quyến rũ do PostgreSQL
              kiểm tra; frontend không tự sửa
              số dư Wallet, điểm hay Điểm quyến rũ.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
