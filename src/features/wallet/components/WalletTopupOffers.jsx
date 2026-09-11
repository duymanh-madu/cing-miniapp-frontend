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
    <section
      className="cing-wallet-offers"
      aria-label="Các mốc ưu đãi nạp Cing Wallet"
    >
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

                  tier.isFeatured
                    ? "is-featured"
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
                {tier.isFeatured ? (
                  <span className="cing-wallet-offer__hot">
                    🔥 ĐANG HOT
                  </span>
                ) : null}

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
