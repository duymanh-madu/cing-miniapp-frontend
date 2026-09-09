const money =
  value =>
    `${new Intl.NumberFormat(
      "vi-VN"
    ).format(
      Number(value || 0)
    )}đ`;


export default function WalletTopupOffers({
  promotion,
  selectedAmount,
  onSelect,
}) {
  if (
    !promotion ||
    promotion.active !== true ||
    !Array.isArray(
      promotion.tiers
    ) ||
    promotion.tiers.length ===
      0
  ) {
    return null;
  }

  return (
    <section className="cing-wallet-offers">
      <div className="cing-wallet-section-title">
        <p>
          TOP-UP PRIVILEGES
        </p>

        <h2>
          Ưu đãi nạp nổi bật
        </h2>

        <span>
          Chọn mức phù hợp và hệ thống sẽ áp dụng quyền lợi theo cấu hình hiện hành.
        </span>
      </div>

      <div className="cing-wallet-offers__rail">
        {promotion.tiers.map(
          (
            tier,
            index
          ) => {
            const selected =
              Number(
                selectedAmount
              ) ===
              tier.minTopupAmount;

            return (
              <button
                key={
                  `${tier.minTopupAmount}-${index}`
                }
                type="button"
                className={[
                  "cing-wallet-offer",
                  selected
                    ? "is-selected"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() =>
                  onSelect(
                    tier.minTopupAmount
                  )
                }
              >
                <span className="cing-wallet-offer__eyebrow">
                  NẠP
                </span>

                <strong>
                  {money(
                    tier.minTopupAmount
                  )}
                </strong>

                <span className="cing-wallet-offer__receive">
                  Nhận{" "}
                  {money(
                    tier.receiveAmount
                  )}
                </span>

                <span className="cing-wallet-offer__bonus">
                  +
                  {money(
                    tier.bonusAmount
                  )}{" "}
                  giá trị
                </span>
              </button>
            );
          }
        )}
      </div>
    </section>
  );
}
