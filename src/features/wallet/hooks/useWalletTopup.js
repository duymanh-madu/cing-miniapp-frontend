import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  requestZaloCheckoutFromShell,
} from "@/infra/payment/zaloCheckoutBridge";

import {
  createWalletTopupSession,
  fetchWalletPromotion,
  reconcileWalletTopup,
} from "../api/walletTopupApi";

import {
  clearPendingWalletTopup,
  extractReconciliationPaymentIdentity,
  normalizeTopupAmountInput,
  normalizeWalletPromotion,
  readPendingWalletTopup,
  reconciliationIsTerminalFailure,
  validateWalletTopupSession,
  walletSnapshotConfirmsTopup,
  writePendingWalletTopup,
} from "../domain/walletTopupDomain";


const RECONCILE_INTERVAL_MS =
  5_000;


export default function useWalletTopup({
  transactions,
  refreshOverview,
}) {
  const [
    promotion,
    setPromotion,
  ] =
    useState(null);

  const [
    promotionLoading,
    setPromotionLoading,
  ] =
    useState(true);

  const [
    amountInput,
    setAmountInputState,
  ] =
    useState("");

  const [
    submitting,
    setSubmitting,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    notice,
    setNotice,
  ] =
    useState("");

  const [
    pendingTopup,
    setPendingTopup,
  ] =
    useState(
      () =>
        readPendingWalletTopup()
    );

  const mounted =
    useRef(true);

  const reconcileInFlight =
    useRef(false);


  const setAmountInput =
    useCallback(
      value => {
        setAmountInputState(
          normalizeTopupAmountInput(
            value
          )
        );
      },
      []
    );


  const releasePendingAsSuccess =
    useCallback(
      () => {
        clearPendingWalletTopup();

        setPendingTopup(
          null
        );

        setError("");

        setNotice(
          "Nạp Cing Wallet đã được xác nhận."
        );

        window.dispatchEvent(
          new CustomEvent(
            "cing_wallet_balance_updated"
          )
        );
      },
      []
    );


  const releasePendingAsFailed =
    useCallback(
      () => {
        clearPendingWalletTopup();

        setPendingTopup(
          null
        );

        setError("");

        setNotice(
          "Giao dịch nạp chưa hoàn tất. Bạn có thể tạo giao dịch mới."
        );
      },
      []
    );


  const reconcilePending =
    useCallback(
      async (
        pending,
        snapshot
      ) => {
        if (!pending) {
          return;
        }

        if (
          walletSnapshotConfirmsTopup(
            snapshot,
            pending
          )
        ) {
          releasePendingAsSuccess();
          return;
        }

        let effectivePending =
          pending;

        try {
          const reconciliation =
            await reconcileWalletTopup(
              pending.transactionCode
            );

          if (
            reconciliationIsTerminalFailure(
              reconciliation
            )
          ) {
            releasePendingAsFailed();
            return;
          }

          const paymentTransactionId =
            extractReconciliationPaymentIdentity(
              reconciliation
            );

          if (
            paymentTransactionId
          ) {
            if (
              pending.paymentTransactionId &&
              pending.paymentTransactionId !==
                paymentTransactionId
            ) {
              /*
               * Fail closed on identity contradiction.
               * Never release pending and never create a new
               * financial session from a mismatched identity.
               */
              if (mounted.current) {
                setError(
                  "Không thể xác minh định danh giao dịch Cing Wallet. Hệ thống sẽ tiếp tục giữ giao dịch ở trạng thái chờ."
                );
              }

              return;
            }

            if (
              !pending.paymentTransactionId
            ) {
              effectivePending = {
                ...pending,
                paymentTransactionId,
              };

              writePendingWalletTopup(
                effectivePending
              );

              if (mounted.current) {
                setPendingTopup(
                  effectivePending
                );
              }
            }
          }

          /*
           * Reconciliation response itself is NOT Wallet success.
           *
           * Success requires the authoritative Wallet ledger row:
           * transaction_type = topup
           * reference_type   = payment_transaction
           * reference_id     = payment_transactions.id
           * amount           = requested amount
           */
          if (
            walletSnapshotConfirmsTopup(
              snapshot,
              effectivePending
            )
          ) {
            releasePendingAsSuccess();
            return;
          }
        } catch {
          /*
           * Transport/reconciliation failure is fail closed.
           * Pending financial identity remains durable locally.
           */
        }

        if (mounted.current) {
          setPendingTopup(
            effectivePending
          );

          setNotice(
            "Giao dịch đang được hệ thống xác minh. Nếu bạn đã thanh toán, không cần nạp lại."
          );
        }
      },
      [
        releasePendingAsFailed,
        releasePendingAsSuccess,
      ]
    );


  const refreshAndReconcile =
    useCallback(
      async (
        explicitPending =
          pendingTopup
      ) => {
        if (
          !explicitPending ||
          typeof refreshOverview !==
            "function" ||
          reconcileInFlight.current
        ) {
          return;
        }

        reconcileInFlight.current =
          true;

        try {
          const snapshot =
            await refreshOverview({
              silent: true,
              force: true,
            });

          await reconcilePending(
            explicitPending,
            snapshot
          );
        } catch {
          /*
           * Wallet overview failure is fail closed.
           */
        } finally {
          reconcileInFlight.current =
            false;
        }
      },
      [
        pendingTopup,
        reconcilePending,
        refreshOverview,
      ]
    );


  useEffect(
    () => {
      mounted.current =
        true;

      fetchWalletPromotion()
        .then(
          data => {
            if (
              mounted.current
            ) {
              setPromotion(
                normalizeWalletPromotion(
                  data
                )
              );
            }
          }
        )
        .catch(
          () => {
            if (
              mounted.current
            ) {
              setPromotion(
                null
              );
            }
          }
        )
        .finally(
          () => {
            if (
              mounted.current
            ) {
              setPromotionLoading(
                false
              );
            }
          }
        );

      return () => {
        mounted.current =
          false;
      };
    },
    []
  );


  /*
   * A Wallet projection may release pending only when it carries
   * the exact canonical settlement ledger identity.
   */
  useEffect(
    () => {
      if (
        !pendingTopup
      ) {
        return;
      }

      if (
        walletSnapshotConfirmsTopup(
          {
            transactions,
          },
          pendingTopup
        )
      ) {
        releasePendingAsSuccess();
      }
    },
    [
      transactions,
      pendingTopup,
      releasePendingAsSuccess,
    ]
  );


  /*
   * Durable frontend recovery.
   *
   * This loop never performs settlement. It only:
   * 1. re-reads authoritative Wallet state;
   * 2. asks backend reconciliation authority to ensure durable work;
   * 3. persists the backend payment identity used for exact ledger match.
   */
  useEffect(
    () => {
      if (
        !pendingTopup
      ) {
        return undefined;
      }

      refreshAndReconcile(
        pendingTopup
      );

      const timer =
        window.setInterval(
          () => {
            refreshAndReconcile(
              pendingTopup
            );
          },
          RECONCILE_INTERVAL_MS
        );

      return () =>
        window.clearInterval(
          timer
        );
    },
    [
      pendingTopup,
      refreshAndReconcile,
    ]
  );


  const submitTopup =
    useCallback(
      async () => {
        if (
          submitting ||
          pendingTopup
        ) {
          return;
        }

        const normalized =
          normalizeTopupAmountInput(
            amountInput
          );

        const amount =
          Number(
            normalized
          );

        if (
          !Number.isSafeInteger(
            amount
          ) ||
          amount <= 0
        ) {
          setError(
            "Vui lòng nhập số tiền nạp hợp lệ."
          );

          return;
        }

        setSubmitting(
          true
        );

        setError("");
        setNotice("");

        try {
          /*
           * Financial caller authority:
           * requested amount only.
           */
          const responsePayload =
            await createWalletTopupSession(
              amount
            );

          const {
            pending,
            zaloOrder,
          } =
            validateWalletTopupSession(
              responsePayload,
              amount
            );

          /*
           * Persist payment transaction code before provider UI.
           * Canonical DB payment id is enriched later only from
           * authenticated backend reconciliation.
           */
          writePendingWalletTopup(
            pending
          );

          setPendingTopup(
            pending
          );

          setNotice(
            "Đã tạo phiên nạp. Sau khi thanh toán, hệ thống sẽ tự xác minh và cập nhật số dư."
          );

          await requestZaloCheckoutFromShell({
            amount:
              zaloOrder.amount,

            item:
              zaloOrder.item,

            desc:
              zaloOrder.desc,

            mac:
              zaloOrder.mac,

            extradata:
              zaloOrder.extradata,

            method:
              zaloOrder.method,
          });

          await refreshAndReconcile(
            pending
          );
        } catch (caught) {
          /*
           * Provider cancellation/error cannot release a payment
           * already created by backend authority.
           */
          setError(
            caught?.response?.data
              ?.message ||
            caught?.message ||
            "Không thể tạo phiên nạp Cing Wallet."
          );
        } finally {
          setSubmitting(
            false
          );
        }
      },
      [
        amountInput,
        pendingTopup,
        refreshAndReconcile,
        submitting,
      ]
    );


  return {
    promotion,
    promotionLoading,

    amountInput,
    setAmountInput,

    submitting,

    error,
    notice,

    pendingTopup,

    submitTopup,
  };
}
