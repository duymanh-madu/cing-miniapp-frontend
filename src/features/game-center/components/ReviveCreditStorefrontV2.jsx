import {useLiveEffect} from "@/runtime/live/useLiveEffect";
import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getOfflineRevivalCreditBalance,
} from "@/games/runtime/offlineRevivalAuthorityClient";

import ReviveCreditPurchaseV2 from
  "./ReviveCreditPurchaseV2";

import RevivePassIcon from
  "./RevivePassIcon";

const PACKAGES = Object.freeze([
  1, 2, 5, 10,
]);

export default function ReviveCreditStorefrontV2({
  userId,
  refreshSignal = 0,
}) {
  const [balance, setBalance] =
    useState(null);

  const [opened, setOpened] = useState(false);

  const [quantity, setQuantity] =
    useState(1);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [refreshKey, setRefreshKey] =
    useState(0);

  const refresh = useCallback(() => {
    setRefreshKey(value => value + 1);
  }, []);

  useLiveEffect(() => {
    let active = true;

    setLoading(true);
    setError("");
    // Retain last confirmed balance while reconciling.

    getOfflineRevivalCreditBalance()
      .then(data => {
        if (!active) return;

        if (
          !Number.isSafeInteger(data?.balance) ||
          data.balance < 0
        ) {
          throw new Error(
            "REVIVE_CREDIT_BALANCE_INVALID"
          );
        }

        setBalance(data.balance);
      })
      .catch(() => {
        if (active) {
          setError(
            "Chưa xác minh được số dư Thẻ hồi sinh."
          );
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => { active = false; };
  }, [userId, refreshKey, refreshSignal], ["game","wallet","missions"]);

  useEffect(() => {
    setBalance(null);
    setOpened(false);
  }, [userId]);

  useEffect(() => {
    const update = () => refresh();
    window.addEventListener("cing:mutation-committed", update);
    window.addEventListener("online", update);
    return () => { window.removeEventListener("cing:mutation-committed", update); window.removeEventListener("online", update); };
  }, [refresh]);

  return (
    <section className="cing-revive-store" aria-label="Cửa hàng Thẻ hồi sinh">
      <details onToggle={event => { if (event.currentTarget.open) setOpened(true); }}>
        <summary className="cing-revive-summary">
          <RevivePassIcon size={34} />
          <span className="cing-revive-label"><strong>Thẻ hồi sinh</strong><small>Tiếp tục ván chơi khi cần</small></span>
          <span className="cing-revive-balance" aria-live="polite">{loading && balance === null ? "…" : balance === null ? "—" : balance.toLocaleString("vi-VN")}<small>thẻ</small></span>
          <span className="cing-revive-action">Mua thêm <span aria-hidden="true">⌄</span></span>
        </summary>
        <div className="cing-revive-expanded">
          <p>Chọn gói dự trữ. Giá và số dư được xác nhận khi mua.</p>
          {error && <div role="alert">{error} <button type="button" onClick={refresh}>Thử lại</button></div>}
          {balance !== null && <>
            <div className="cing-revive-packages" role="group" aria-label="Số lượng Thẻ hồi sinh">
              {PACKAGES.map(count => <button key={count} type="button" aria-pressed={quantity === count} onClick={() => setQuantity(count)}>+{count}<small>thẻ</small></button>)}
            </div>
            {opened && <ReviveCreditPurchaseV2 userId={userId} requiredQuantity={quantity} purchaseContext="storefront" onPurchased={receipt => {setBalance(receipt.credit_balance_after); refresh();}} />}
          </>}
        </div>
      </details>
      {error && <p className="cing-revive-error" role="status">Chưa xác minh được số dư. <button type="button" onClick={refresh}>Thử lại</button></p>}
    </section>
  );
}
