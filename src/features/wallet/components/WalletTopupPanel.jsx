import WalletTopupOffers
  from "./WalletTopupOffers";


const money =
  value =>
    `${new Intl.NumberFormat(
      "vi-VN"
    ).format(
      Number(value || 0)
    )}đ`;


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

  return (
    <section
      id="cing-wallet-topup"
      className="cing-wallet-topup"
    >
      <div className="cing-wallet-section-title">
        <p>
          WALLET TOP-UP
        </p>

        <h2>
          Nạp Cing Wallet
        </h2>

        <span>
          Nạp trước để thanh toán nhanh hơn và nhận ưu đãi khi chương trình nạp đang diễn ra.
        </span>
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
