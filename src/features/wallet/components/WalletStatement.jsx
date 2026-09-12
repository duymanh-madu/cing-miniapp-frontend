const money =
  value =>
    `${new Intl.NumberFormat(
      "vi-VN"
    ).format(
      Math.abs(
        Number(value)
      )
    )}đ`;


function resolveTitle(
  row
) {
  switch (
    row.transaction_type
  ) {
    case "topup":
      return "Nạp Cing Wallet";

    case "topup_promotion":
      return "Khuyến mại nạp Cing Wallet";

    case "payment":
      return (
        row.note ||
        row.reason ||
        "Thanh toán Cing Wallet"
      );

    case "refund":
    case "reversal":
      return (
        row.note ||
        row.reason ||
        "Hoàn tiền Cing Wallet"
      );

    case "admin_adjustment":
      return "Điều chỉnh số dư Cing Wallet";

    default:
      return (
        row.reason ||
        row.note ||
        "Giao dịch Cing Wallet"
      );
  }
}



function resolveDescription(
  row
) {
  if (
    row.transaction_type !==
      "admin_adjustment"
  ) {
    return "";
  }

  return String(
    row.note ||
    ""
  ).trim();
}

function resolveTime(
  createdAt
) {
  const date =
    new Date(
      createdAt
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "vi-VN",
    {
      hour:
        "2-digit",
      minute:
        "2-digit",
      day:
        "2-digit",
      month:
        "2-digit",
    }
  ).format(date);
}


export default function WalletStatement({
  transactions = [],
}) {
  const items =
    transactions.slice(
      0,
      8
    );

  return (
    <section
      id="cing-wallet-history"
      className="cing-wallet-statement"
    >
      <div className="cing-wallet-section-title">
        <p>
          WALLET STATEMENT
        </p>

        <h2>
          Giao dịch gần đây
        </h2>
      </div>

      {items.length === 0 ? (
        <div className="cing-wallet-statement__empty">
          Chưa có giao dịch Cing Wallet.
        </div>
      ) : (
        <div className="cing-wallet-statement__list">
          {items.map(
            transaction => {
              const amount =
                transaction.amount;

              const positive =
                amount > 0;
              const description =
                resolveDescription(
                  transaction
                );

              return (
                <article
                  key={
                    transaction.id
                  }
                  className="cing-wallet-statement__row"
                >
                  <div className="cing-wallet-statement__mark">
                    {positive
                      ? "+"
                      : "−"}
                  </div>

                  <div className="cing-wallet-statement__body">
                    <strong>
                      {resolveTitle(
                        transaction
                      )}
                    </strong>

                    {description && (
                      <p className="cing-wallet-statement__note">
                        {description}
                      </p>
                    )}


                    <span>
                      {resolveTime(
                        transaction.created_at
                      )}
                    </span>
                  </div>

                  <div
                    className={[
                      "cing-wallet-statement__amount",
                      positive
                        ? "is-positive"
                        : "is-negative",
                    ].join(" ")}
                  >
                    {positive
                      ? "+"
                      : "−"}
                    {money(
                      amount
                    )}
                  </div>
                </article>
              );
            }
          )}
        </div>
      )}
    </section>
  );
}
