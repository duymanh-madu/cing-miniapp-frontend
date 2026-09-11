import WalletTopupOffers
  from "./WalletTopupOffers";


const money =
  value =>
    `${new Intl.NumberFormat(
      "vi-VN"
    ).format(
      Number(value || 0)
    )}đ`;


function formatCampaignDate(
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

  const parts =
    new Intl.DateTimeFormat(
      "vi-VN",
      {
        timeZone:
          "Asia/Ho_Chi_Minh",

        hour12:
          false,

        hour:
          "2-digit",

        minute:
          "2-digit",

        day:
          "2-digit",

        month:
          "2-digit",

        year:
          "numeric",
      }
    ).formatToParts(
      date
    );

  const read =
    type =>
      parts.find(
        part =>
          part.type === type
      )?.value || "";

  const hour =
    read("hour");

  const minute =
    read("minute");

  const day =
    read("day");

  const month =
    read("month");

  const year =
    read("year");

  if (
    !hour ||
    !minute ||
    !day ||
    !month ||
    !year
  ) {
    return null;
  }

  return (
    `${hour}:${minute} ` +
    `${day}/${month}/${year}`
  );
}


export default function WalletTopupPanel({
  promotion,
  promotionLoading,

  amountInput,
  onAmountChange,

  submitting,
  pendingTopup,

  error,
  notice,

  onSubmit,
}) {
  const disabled =
    submitting ||
    Boolean(
      pendingTopup
    );

  const amount =
    Number(
      amountInput || 0
    );

  const activePromotion =
    promotion?.active ===
    true
      ? promotion
      : null;

  const campaignName =
    activePromotion?.name ||
    null;

  const campaignStartsAt =
    formatCampaignDate(
      activePromotion?.startsAt
    );

  const campaignEndsAt =
    formatCampaignDate(
      activePromotion?.endsAt
    );


  return (
    <section
      id="cing-wallet-topup"
      className="cing-wallet-topup"
    >
      <div className="cing-wallet-promotion-head">
        <div className="cing-wallet-promotion-head__meta">
          <span className="cing-wallet-promotion-head__eyebrow">
            WALLET TOP-UP
          </span>

          {activePromotion ? (
            <span className="cing-wallet-promotion-head__status">
              <i />
              ĐANG DIỄN RA
            </span>
          ) : null}
        </div>

        <h2>
          {campaignName ||
            "Nạp Cing Wallet"}
        </h2>

        {activePromotion ? (
          <>
            {(
              campaignStartsAt ||
              campaignEndsAt
            ) && (
              <div className="cing-wallet-promotion-head__period">
                {campaignStartsAt && (
                  <div>
                    <span>
                      Bắt đầu
                    </span>

                    <strong>
                      {campaignStartsAt}
                    </strong>
                  </div>
                )}

                {campaignEndsAt && (
                  <div>
                    <span>
                      Kết thúc
                    </span>

                    <strong>
                      {campaignEndsAt}
                    </strong>
                  </div>
                )}
              </div>
            )}

            <p className="cing-wallet-promotion-head__copy">
              Chọn mốc nạp bên dưới để nhận đúng quyền lợi của chương trình đang áp dụng.
            </p>
          </>
        ) : (
          <p className="cing-wallet-promotion-head__copy">
            Nạp trước để thanh toán nhanh hơn tại Cing.
          </p>
        )}
      </div>


      {promotionLoading ? (
        <div className="cing-wallet-offers-skeleton">
          <span />
          <span />
          <span />
        </div>
      ) : (
        <WalletTopupOffers
          promotion={
            promotion
          }
          selectedAmount={
            amountInput
          }
          onSelect={
            onAmountChange
          }
        />
      )}


      <div className="cing-wallet-topup__composer">
        <label
          htmlFor="cing-wallet-topup-amount"
        >
          Số tiền muốn nạp
        </label>

        <div className="cing-wallet-topup__input-row">
          <div className="cing-wallet-topup__input-shell">
            <input
              id="cing-wallet-topup-amount"
              inputMode="numeric"
              autoComplete="off"
              value={
                amountInput
              }
              disabled={
                disabled
              }
              onChange={
                event =>
                  onAmountChange(
                    event.target.value
                  )
              }
              placeholder="Nhập số tiền"
            />

            <span>
              VND
            </span>
          </div>

          <button
            type="button"
            className="cing-wallet-topup__submit"
            disabled={
              disabled
            }
            onClick={
              onSubmit
            }
          >
            {submitting
              ? "Đang tạo..."
              : "Nạp tiền"}
          </button>
        </div>

        {amountInput && (
          <p className="cing-wallet-topup__preview">
            Bạn sẽ nạp{" "}
            <strong>
              {money(
                amount
              )}
            </strong>
          </p>
        )}
      </div>


      {pendingTopup && (
        <div
          className="cing-wallet-topup__pending"
          role="status"
        >
          <div className="cing-wallet-topup__pending-mark">
            ◌
          </div>

          <div>
            <strong>
              Đang xác minh{" "}
              {money(
                pendingTopup.amount
              )}
            </strong>

            <p>
              Giao dịch đang được xác nhận tự động. Vui lòng không tạo thêm một lần nạp cho cùng khoản tiền.
            </p>
          </div>
        </div>
      )}


      {notice && (
        <p
          className="cing-wallet-topup__notice"
          role="status"
        >
          {notice}
        </p>
      )}

      {error && (
        <p
          className="cing-wallet-topup__error"
          role="alert"
        >
          {error}
        </p>
      )}
    </section>
  );
}
