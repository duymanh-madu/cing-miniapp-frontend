import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import apiClient from "@/infra/api/apiClient";
import "./admin-wallet.css";

let nextTierUiId = 0;

function createTierUiId() {
  nextTierUiId += 1;

  return `cing-wallet-tier-${nextTierUiId}`;
}

const EMPTY_TIER = {
  min_topup_amount: "",
  bonus_amount: "",
  is_featured: false,
};

const moneyFormatter =
  new Intl.NumberFormat("vi-VN");

function formatMoney(value) {
  const amount =
    Number(value);

  return Number.isFinite(amount)
    ? `${moneyFormatter.format(amount)}đ`
    : "0đ";
}

function safeNonNegativeInteger(
  value
) {
  const amount =
    Number(value);

  return (
    Number.isSafeInteger(amount) &&
    amount >= 0
  )
    ? amount
    : 0;
}

function positiveInteger(
  value
) {
  const amount =
    Number(value);

  return (
    Number.isSafeInteger(amount) &&
    amount > 0
  )
    ? amount
    : null;
}

function toLocalInput(
  value
) {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  const offset =
    date.getTimezoneOffset() *
    60_000;

  return new Date(
    date.getTime() -
    offset
  )
    .toISOString()
    .slice(0, 16);
}

function toIsoOrNull(
  value
) {
  if (!value) {
    return null;
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  return date.toISOString();
}

function normalizePromotion(
  data
) {
  return {
    enabled:
      data?.enabled ===
      true,

    name:
      typeof data?.name ===
      "string"
        ? data.name
        : "",

    starts_at:
      toLocalInput(
        data?.starts_at
      ),

    ends_at:
      toLocalInput(
        data?.ends_at
      ),

    tiers:
      Array.isArray(
        data?.tiers
      )
        ? data.tiers.map(
            tier => ({
              _ui_id:
                createTierUiId(),

              min_topup_amount:
                String(
                  tier
                    ?.min_topup_amount ??
                  ""
                ),

              bonus_amount:
                String(
                  tier
                    ?.bonus_amount ??
                  ""
                ),

              is_featured:
                tier
                  ?.is_featured ===
                true,
            })
          )
        : [],
  };
}

function backendErrorMessage(
  error
) {
  return (
    error
      ?.response
      ?.data
      ?.error ||
    "Không thể hoàn tất thao tác Cing Wallet."
  );
}

export default function AdminWallet({
  token,
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
    promotion,
    setPromotion,
  ] =
    useState(
      normalizePromotion(
        null
      )
    );

  const [
    summary,
    setSummary,
  ] =
    useState(null);

  const [
    reportFrom,
    setReportFrom,
  ] =
    useState("");

  const [
    reportTo,
    setReportTo,
  ] =
    useState("");

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    loadingSummary,
    setLoadingSummary,
  ] =
    useState(false);

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    success,
    setSuccess,
  ] =
    useState("");

  const loadPromotion =
    useCallback(
      async () => {
        const response =
          await apiClient.get(
            "/admin/wallet/promotion",
            {
              headers,
            }
          );

        setPromotion(
          normalizePromotion(
            response
              .data
              ?.data
          )
        );
      },
      [headers]
    );

  const loadSummary =
    useCallback(
      async (
        from = "",
        to = ""
      ) => {
        setLoadingSummary(
          true
        );

        try {
          const params = {};

          if (from) {
            params.from =
              toIsoOrNull(from);
          }

          if (to) {
            params.to =
              toIsoOrNull(to);
          }

          const response =
            await apiClient.get(
              "/admin/wallet/summary",
              {
                headers,
                params,
              }
            );

          setSummary(
            response
              .data
              ?.data ??
            null
          );
        } finally {
          setLoadingSummary(
            false
          );
        }
      },
      [headers]
    );

  useEffect(
    () => {
      let active = true;

      async function load() {
        setLoading(true);
        setError("");

        try {
          const [
            promotionResponse,
            summaryResponse,
          ] =
            await Promise.all([
              apiClient.get(
                "/admin/wallet/promotion",
                {
                  headers,
                }
              ),

              apiClient.get(
                "/admin/wallet/summary",
                {
                  headers,
                }
              ),
            ]);

          if (!active) {
            return;
          }

          setPromotion(
            normalizePromotion(
              promotionResponse
                .data
                ?.data
            )
          );

          setSummary(
            summaryResponse
              .data
              ?.data ??
            null
          );
        } catch (
          loadError
        ) {
          if (active) {
            setError(
              backendErrorMessage(
                loadError
              )
            );
          }
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      }

      load();

      return () => {
        active = false;
      };
    },
    [headers]
  );

  const updateField =
    (
      field,
      value
    ) => {
      setPromotion(
        current => ({
          ...current,
          [field]:
            value,
        })
      );
    };

  const updateTier =
    (
      index,
      field,
      value
    ) => {
      setPromotion(
        current => ({
          ...current,

          tiers:
            current.tiers.map(
              (
                tier,
                tierIndex
              ) => {
                if (
                  field ===
                    "is_featured" &&
                  value ===
                    true &&
                  tierIndex !==
                    index
                ) {
                  return {
                    ...tier,
                    is_featured:
                      false,
                  };
                }

                if (
                  tierIndex !==
                  index
                ) {
                  return tier;
                }

                return {
                  ...tier,
                  [field]:
                    value,
                };
              }
            ),
        })
      );
    };

  const addTier =
    () => {
      setPromotion(
        current => ({
          ...current,

          tiers: [
            ...current.tiers,
            {
              ...EMPTY_TIER,
              _ui_id:
                createTierUiId(),
            },
          ],
        })
      );
    };

  const removeTier =
    index => {
      setPromotion(
        current => ({
          ...current,

          tiers:
            current
              .tiers
              .filter(
                (
                  _,
                  tierIndex
                ) =>
                  tierIndex !==
                  index
              ),
        })
      );
    };

  const validatePromotion =
    () => {
      if (
        promotion.enabled &&
        promotion
          .tiers
          .length ===
          0
      ) {
        return "Chương trình đang bật nhưng chưa có mốc nạp.";
      }

      const thresholds =
        new Set();

      let featuredCount = 0;

      for (
        const tier
        of promotion.tiers
      ) {
        const threshold =
          positiveInteger(
            tier
              .min_topup_amount
          );

        const bonus =
          positiveInteger(
            tier
              .bonus_amount
          );

        if (
          threshold === null ||
          bonus === null
        ) {
          return "Mức nạp và tiền thưởng phải là số nguyên dương hợp lệ.";
        }

        if (
          thresholds.has(
            threshold
          )
        ) {
          return "Không được cấu hình hai mốc nạp giống nhau.";
        }

        thresholds.add(
          threshold
        );

        if (
          tier
            .is_featured ===
          true
        ) {
          featuredCount +=
            1;
        }
      }

      if (
        featuredCount > 1
      ) {
        return "Chỉ được chọn tối đa một mốc Đang hot.";
      }

      const startsAt =
        toIsoOrNull(
          promotion
            .starts_at
        );

      const endsAt =
        toIsoOrNull(
          promotion
            .ends_at
        );

      if (
        promotion.starts_at &&
        !startsAt
      ) {
        return "Thời gian bắt đầu không hợp lệ.";
      }

      if (
        promotion.ends_at &&
        !endsAt
      ) {
        return "Thời gian kết thúc không hợp lệ.";
      }

      if (
        startsAt &&
        endsAt &&
        new Date(
          endsAt
        ).getTime() <=
          new Date(
            startsAt
          ).getTime()
      ) {
        return "Thời gian kết thúc phải sau thời gian bắt đầu.";
      }

      return null;
    };

  const savePromotion =
    async () => {
      const validationError =
        validatePromotion();

      if (
        validationError
      ) {
        setError(
          validationError
        );

        setSuccess("");
        return;
      }

      setSaving(true);
      setError("");
      setSuccess("");

      try {
        const payload = {
          enabled:
            promotion.enabled,

          name:
            promotion
              .name
              .trim() ||
            null,

          starts_at:
            toIsoOrNull(
              promotion
                .starts_at
            ),

          ends_at:
            toIsoOrNull(
              promotion
                .ends_at
            ),

          tiers:
            promotion
              .tiers
              .map(
                tier => ({
                  min_topup_amount:
                    String(
                      positiveInteger(
                        tier
                          .min_topup_amount
                      )
                    ),

                  bonus_amount:
                    String(
                      positiveInteger(
                        tier
                          .bonus_amount
                      )
                    ),

                  is_featured:
                    tier
                      .is_featured ===
                    true,
                })
              ),
        };

        await apiClient.put(
          "/admin/wallet/promotion",
          payload,
          {
            headers,
          }
        );

        await loadPromotion();

        setSuccess(
          "Đã lưu cấu hình Cing Wallet."
        );
      } catch (
        saveError
      ) {
        setError(
          backendErrorMessage(
            saveError
          )
        );
      } finally {
        setSaving(false);
      }
    };

  const runReport =
    async () => {
      setError("");
      setSuccess("");

      const from =
        toIsoOrNull(
          reportFrom
        );

      const to =
        toIsoOrNull(
          reportTo
        );

      if (
        reportFrom &&
        !from
      ) {
        setError(
          "Mốc bắt đầu báo cáo không hợp lệ."
        );
        return;
      }

      if (
        reportTo &&
        !to
      ) {
        setError(
          "Mốc kết thúc báo cáo không hợp lệ."
        );
        return;
      }

      if (
        from &&
        to &&
        new Date(
          to
        ).getTime() <=
          new Date(
            from
          ).getTime()
      ) {
        setError(
          "Mốc kết thúc báo cáo phải sau mốc bắt đầu."
        );
        return;
      }

      try {
        await loadSummary(
          reportFrom,
          reportTo
        );
      } catch (
        reportError
      ) {
        setError(
          backendErrorMessage(
            reportError
          )
        );
      }
    };

  if (loading) {
    return (
      <div className="admin-wallet">
        <div className="admin-wallet__loading">
          Đang tải Cing Wallet…
        </div>
      </div>
    );
  }

  const current =
    summary?.current ??
    {};

  const totals =
    summary
      ?.period_totals ??
    {};

  return (
    <div className="admin-wallet">
      <header className="admin-wallet__hero">
        <div>
          <p className="admin-wallet__eyebrow">
            FINANCIAL CONTROL CENTER
          </p>

          <h1>
            Cing Wallet
          </h1>

          <p className="admin-wallet__intro">
            Theo dõi số dư và điều hành ưu đãi nạp tiền từ authority backend.
          </p>
        </div>

        <span
          className={[
            "admin-wallet__status",
            promotion.enabled
              ? "is-live"
              : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {promotion.enabled
            ? "ĐANG BẬT"
            : "ĐANG TẮT"}
        </span>
      </header>

      {error ? (
        <div className="admin-wallet__notice is-error">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="admin-wallet__notice is-success">
          {success}
        </div>
      ) : null}

      <section className="admin-wallet__section">
        <div className="admin-wallet__section-head">
          <div>
            <p>
              WALLET SNAPSHOT
            </p>

            <h2>
              Tổng quan tài chính
            </h2>
          </div>
        </div>

        <div className="admin-wallet__stats">
          <article>
            <span>
              Tổng số dư Wallet
            </span>

            <strong>
              {formatMoney(
                safeNonNegativeInteger(
                  current
                    .total_wallet_balance
                )
              )}
            </strong>
          </article>

          <article>
            <span>
              Tài khoản Wallet
            </span>

            <strong>
              {moneyFormatter.format(
                safeNonNegativeInteger(
                  current
                    .account_count
                )
              )}
            </strong>
          </article>

          <article>
            <span>
              Tiền thật đã nạp
            </span>

            <strong>
              {formatMoney(
                safeNonNegativeInteger(
                  totals
                    .real_money_topup
                )
              )}
            </strong>
          </article>

          <article>
            <span>
              Bonus khuyến mại
            </span>

            <strong>
              {formatMoney(
                safeNonNegativeInteger(
                  totals
                    .promotion_bonus
                )
              )}
            </strong>
          </article>

          <article>
            <span>
              Đã chi bằng Wallet
            </span>

            <strong>
              {formatMoney(
                safeNonNegativeInteger(
                  totals
                    .wallet_spending
                )
              )}
            </strong>
          </article>
        </div>

        <div className="admin-wallet__report">
          <label>
            <span>
              Từ thời điểm
            </span>

            <input
              type="datetime-local"
              value={reportFrom}
              onChange={
                event =>
                  setReportFrom(
                    event
                      .target
                      .value
                  )
              }
            />
          </label>

          <label>
            <span>
              Đến thời điểm
            </span>

            <input
              type="datetime-local"
              value={reportTo}
              onChange={
                event =>
                  setReportTo(
                    event
                      .target
                      .value
                  )
              }
            />
          </label>

          <button
            type="button"
            onClick={runReport}
            disabled={
              loadingSummary
            }
          >
            {loadingSummary
              ? "Đang tải…"
              : "Xem báo cáo"}
          </button>
        </div>
      </section>

      <section className="admin-wallet__section">
        <div className="admin-wallet__section-head">
          <div>
            <p>
              TOP-UP PROMOTION
            </p>

            <h2>
              Chương trình ưu đãi nạp
            </h2>
          </div>

          <label className="admin-wallet__switch">
            <input
              type="checkbox"
              checked={
                promotion.enabled
              }
              onChange={
                event =>
                  updateField(
                    "enabled",
                    event
                      .target
                      .checked
                  )
              }
            />

            <span />

            <strong>
              {promotion.enabled
                ? "Bật"
                : "Tắt"}
            </strong>
          </label>
        </div>

        <div className="admin-wallet__form-grid">
          <label className="is-wide">
            <span>
              Tên chương trình
            </span>

            <input
              type="text"
              maxLength={160}
              value={
                promotion.name
              }
              placeholder="Ví dụ: Đặc quyền thành viên tháng 9"
              onChange={
                event =>
                  updateField(
                    "name",
                    event
                      .target
                      .value
                  )
              }
            />
          </label>

          <label>
            <span>
              Bắt đầu
            </span>

            <input
              type="datetime-local"
              value={
                promotion
                  .starts_at
              }
              onChange={
                event =>
                  updateField(
                    "starts_at",
                    event
                      .target
                      .value
                  )
              }
            />
          </label>

          <label>
            <span>
              Kết thúc
            </span>

            <input
              type="datetime-local"
              value={
                promotion
                  .ends_at
              }
              onChange={
                event =>
                  updateField(
                    "ends_at",
                    event
                      .target
                      .value
                  )
              }
            />
          </label>
        </div>

        <div className="admin-wallet__tier-head">
          <div>
            <p>
              REWARD TIERS
            </p>

            <h3>
              Các mốc nạp
            </h3>
          </div>

          <button
            type="button"
            onClick={addTier}
          >
            + Thêm mốc
          </button>
        </div>

        <div className="admin-wallet__tiers">
          {promotion.tiers.length ===
          0 ? (
            <div className="admin-wallet__empty">
              Chưa có mốc nạp. Khi chương trình bật, cần ít nhất một mốc hợp lệ.
            </div>
          ) : null}

          {promotion.tiers.map(
            (
              tier,
              index
            ) => {
              const threshold =
                positiveInteger(
                  tier
                    .min_topup_amount
                ) ?? 0;

              const bonus =
                positiveInteger(
                  tier
                    .bonus_amount
                ) ?? 0;

              const total =
                threshold +
                bonus;

              const percentage =
                threshold > 0
                  ? Math.round(
                      (
                        bonus /
                        threshold
                      ) *
                        100
                    )
                  : 0;

              return (
                <article
                  className={[
                    "admin-wallet__tier",
                    tier.is_featured
                      ? "is-featured"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  key={
                    tier._ui_id
                  }
                >
                  {tier.is_featured ? (
                    <div className="admin-wallet__hot">
                      🔥 ĐANG HOT
                    </div>
                  ) : null}

                  <div className="admin-wallet__tier-fields">
                    <label>
                      <span>
                        Khách nạp
                      </span>

                      <input
                        inputMode="numeric"
                        value={
                          tier
                            .min_topup_amount
                        }
                        onChange={
                          event =>
                            updateTier(
                              index,
                              "min_topup_amount",
                              event
                                .target
                                .value
                                .replace(
                                  /\D/g,
                                  ""
                                )
                            )
                        }
                      />
                    </label>

                    <label>
                      <span>
                        Thưởng thêm
                      </span>

                      <input
                        inputMode="numeric"
                        value={
                          tier
                            .bonus_amount
                        }
                        onChange={
                          event =>
                            updateTier(
                              index,
                              "bonus_amount",
                              event
                                .target
                                .value
                                .replace(
                                  /\D/g,
                                  ""
                                )
                            )
                        }
                      />
                    </label>
                  </div>

                  <div className="admin-wallet__tier-preview">
                    <div>
                      <span>
                        Tổng khách nhận
                      </span>

                      <strong>
                        {formatMoney(
                          total
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Tỷ lệ bonus
                      </span>

                      <strong>
                        +{percentage}%
                      </strong>
                    </div>
                  </div>

                  <div className="admin-wallet__tier-actions">
                    <label>
                      <input
                        type="checkbox"
                        checked={
                          tier
                            .is_featured
                        }
                        onChange={
                          event =>
                            updateTier(
                              index,
                              "is_featured",
                              event
                                .target
                                .checked
                            )
                        }
                      />

                      <span>
                        🔥 Đánh dấu Đang hot
                      </span>
                    </label>

                    <button
                      type="button"
                      onClick={() =>
                        removeTier(
                          index
                        )
                      }
                    >
                      Xóa mốc
                    </button>
                  </div>
                </article>
              );
            }
          )}
        </div>

        <div className="admin-wallet__footer">
          <p>
            Tiền thật và bonus chỉ được backend xác lập. Giao diện này không trực tiếp thay đổi số dư Wallet.
          </p>

          <button
            type="button"
            className="admin-wallet__save"
            onClick={
              savePromotion
            }
            disabled={saving}
          >
            {saving
              ? "Đang lưu…"
              : "Lưu cấu hình"}
          </button>
        </div>
      </section>
    </div>
  );
}
