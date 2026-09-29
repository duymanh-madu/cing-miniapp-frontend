import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import useAuthStore from "@/stores/auth/authStore";
import {
  useRuntimeCustomerIdentityStore,
} from "@/runtime/customer/runtimeCustomerIdentityStore";

import {
  createOfflineRevivalRequestId,
  startOfflineRevivalSession,
  recoverOfflineRevivalSession,
  abandonOfflineRevivalSession,
  markOfflineRevivalPending,
  purchaseOfflineRevival,
  finalizeOfflineRevivalSession,
  getOfflineRevivalCreditBalance,
} from "@/games/runtime/offlineRevivalAuthorityClient";

import {
  createOfflineRevivalStartCoordinator,
} from "@/games/runtime/offlineRevivalStartCoordinator";

import {
  createOfflineRevivalDurableCoordinator,
} from "@/games/runtime/offlineRevivalDurableCoordinator";

import {
  clearOfflineRevivalStartIntent,
} from "@/games/runtime/offlineRevivalStartIntent";

import ReviveCreditPurchaseV2 from
  "./ReviveCreditPurchaseV2";

/*
 * CING GAME CENTER V2 — CUSTOMER SESSION ADAPTER
 *
 * Frontend UI does not own credit debits.
 * PostgreSQL owns start/pending/revive/finalize.
 *
 * The outer Game Center feature flag remains OFF
 * unless explicitly enabled for V2 release.
 */

const FINALIZE_PREFIX =
  "cing:offline-revival:finalize:v1:";

function fail(message) {
  throw new Error(message);
}

const REVIVAL_PRIMARY_ACTION_STYLE =
  Object.freeze({
    display: "block",
    width: "100%",
    minHeight: 48,
    marginTop: 12,
    padding: "12px 16px",
    border: "none",
    borderRadius: 14,
    background:
      "linear-gradient(135deg,#d4531c,#ff7a32)",
    color: "#fff",
    fontSize: 15,
    fontWeight: 900,
    lineHeight: 1.25,
    textAlign: "center",
    appearance: "none",
    WebkitAppearance: "none",
  });

const REVIVAL_SECONDARY_ACTION_STYLE =
  Object.freeze({
    display: "block",
    width: "100%",
    minHeight: 44,
    marginTop: 10,
    padding: "10px 14px",
    border: "1px solid rgba(74,37,19,.22)",
    borderRadius: 13,
    background: "#fffaf3",
    color: "#4a2513",
    fontSize: 14,
    fontWeight: 850,
    lineHeight: 1.25,
    textAlign: "center",
    appearance: "none",
    WebkitAppearance: "none",
  });

function phoneOf(value) {
  const digits = String(value || "")
    .replace(/\D/g, "")
    .replace(/^84/, "0");

  return /^0[0-9]{8,10}$/.test(digits)
    ? digits
    : "";
}

function memberPhone() {
  const profile =
    useAuthStore.getState().profile;

  return (
    phoneOf(
      useRuntimeCustomerIdentityStore
        .getState()
        .identity?.phone
    ) ||
    phoneOf(profile?.phone)
  );
}

function finalizeKey(gameKey) {
  return FINALIZE_PREFIX + gameKey;
}

function ensureFinalizeIntent({
  storage,
  gameKey,
  userId,
  sessionId,
  startRequestId,
  eventSeq,
  score,
  bestCombo,
}) {
  const key = finalizeKey(gameKey);
  const raw = storage.getItem(key);

  if (raw !== null) {
    const saved = JSON.parse(raw);

    if (
      saved?.user_id !== userId ||
      saved?.game_key !== gameKey ||
      saved?.session_id !== sessionId ||
      saved?.start_request_id !==
        startRequestId ||
      saved?.event_seq !== eventSeq ||
      saved?.score !== score ||
      saved?.best_combo !== bestCombo ||
      typeof saved.request_id !== "string"
    ) {
      fail(
        "Giao dịch lưu điểm trước chưa được xác minh."
      );
    }

    return saved;
  }

  const intent = {
    version: 1,
    user_id: userId,
    game_key: gameKey,
    session_id: sessionId,
    start_request_id: startRequestId,
    event_seq: eventSeq,
    score,
    best_combo: bestCombo,
    request_id:
      createOfflineRevivalRequestId(),
  };

  const serialized =
    JSON.stringify(intent);

  storage.setItem(key, serialized);

  if (storage.getItem(key) !== serialized) {
    fail("Không thể lưu yêu cầu kết thúc an toàn.");
  }

  return intent;
}

function readFinalizeIntent({
  storage,
  gameKey,
  userId,
}) {
  const raw =
    storage.getItem(finalizeKey(gameKey));

  if (raw === null) return null;

  const intent = JSON.parse(raw);

  if (
    !intent ||
    intent.version !== 1 ||
    intent.game_key !== gameKey ||
    intent.user_id !== userId ||
    typeof intent.session_id !== "string" ||
    typeof intent.start_request_id !==
      "string" ||
    typeof intent.request_id !== "string" ||
    !Number.isSafeInteger(
      intent.event_seq
    ) ||
    !Number.isSafeInteger(
      intent.score
    ) ||
    !Number.isSafeInteger(
      intent.best_combo
    ) ||
    intent.score < 0 ||
    intent.best_combo < 0
  ) {
    fail(
      "Yêu cầu lưu điểm cũ không hợp lệ " +
      "hoặc thuộc tài khoản khác."
    );
  }

  return intent;
}

function completeFinalizedIntent({
  storage,
  gameKey,
  userId,
  intent,
}) {
  const current =
    readFinalizeIntent({
      storage,
      gameKey,
      userId,
    });

  if (
    !current ||
    current.request_id !==
      intent.request_id ||
    current.session_id !==
      intent.session_id
  ) {
    fail(
      "Không thể xác minh yêu cầu " +
      "lưu điểm trước khi dọn dẹp."
    );
  }

  /*
   * Clearing the start intent can be
   * safely replayed if it was removed
   * before a later storage failure.
   */
  clearOfflineRevivalStartIntent({
    storage,
    userId,
    gameKey,
    requestId:
      intent.start_request_id,
  });

  /*
   * Remove the finalize intent LAST.
   * A failure above retains its request ID.
   */
  storage.removeItem(
    finalizeKey(gameKey)
  );

  if (
    storage.getItem(
      finalizeKey(gameKey)
    ) !== null
  ) {
    fail(
      "Chưa thể hoàn tất lưu trữ " +
      "kết quả trận chơi."
    );
  }
}

export default function CingOfflineRevivalGameV2({
  GameComp,
  gameKey,
  onExit,
  onShowLeaderboard,
  onChallengeProgress,
}) {
  const sessionRef = useRef(null);
  const coordinatorRef = useRef(null);
  const startRef = useRef(null);
  const startBusyRef = useRef(false);
  const mutationBusyRef = useRef(false);
  const reviveUnknownRef = useRef(false);
  const pendingReadyRef = useRef(false);
  const [pendingReady, setPendingReady] =
    useState(false);
  const pendingResultRef = useRef(null);
  const finalizeUnknownRef = useRef(false);

  const [status, setStatus] =
    useState("idle");

  const [resumeToken, setResumeToken] =
    useState(0);

  const [roundKey, setRoundKey] =
    useState(0);

  const [finalResult, setFinalResult] =
    useState(null);

  const [creditBalance, setCreditBalance] =
    useState(null);

  const [revivesUsed, setRevivesUsed] =
    useState(0);

  const [message, setMessage] =
    useState("");

  const [busy, setBusy] =
    useState(false);

  const refreshBalance =
    useCallback(async () => {
      try {
        const data =
          await getOfflineRevivalCreditBalance();

        if (
          !Number.isSafeInteger(data?.balance) ||
          data.balance < 0
        ) {
          throw new Error(
            "REVIVAL_BALANCE_INVALID"
          );
        }

        setCreditBalance(data.balance);
      } catch {
        setCreditBalance(null);
      }
    }, []);

  const start = useCallback(async () => {
    if (sessionRef.current) {
      return true;
    }

    if (
      startBusyRef.current ||
      mutationBusyRef.current
    ) {
      return false;
    }

    const userId = memberPhone();

    if (!userId) {
      setMessage(
        "Không xác định được thành viên."
      );

      return false;
    }

    startBusyRef.current = true;
    setMessage("");

    try {
      const storage = window.localStorage;

      const terminalIntent =
        readFinalizeIntent({
          storage,
          gameKey,
          userId,
        });

      if (terminalIntent) {
        setStatus(
          "recovery_required"
        );

        setMessage(
          "Có kết quả trận trước cần " +
          "xác minh. Không mở phiên mới."
        );

        return false;
      }

      if (!startRef.current) {
        startRef.current =
          createOfflineRevivalStartCoordinator({
            storage,
            startSession:
              startOfflineRevivalSession,
            recoverSession:
              recoverOfflineRevivalSession,
            abandonSession:
              abandonOfflineRevivalSession,
          });
      }

      const result =
        await startRef.current.begin({
          userId,
          gameKey,
        });

      /*
       * An existing authorized session does
       * not reconstruct a lost canvas.
       */
      if (
        result.status !== "ready" ||
        result.session?.applied !== true ||
        result.session?.session_status !==
          "active"
      ) {
        setMessage(
          "Có phiên chơi cần xác minh. " +
          "Không tự tạo phiên mới."
        );

        return false;
      }

      const session = result.session;

      if (
        session.event_seq !== 0 ||
        session.revives_used !== 0
      ) {
        fail(
          "Phản hồi phiên mới không hợp lệ."
        );
      }

      const coordinator =
        createOfflineRevivalDurableCoordinator({
          storage,
          userId,
          gameKey,
          sessionId:
            session.session_id,
          eventSeq:
            session.event_seq,
          revivesUsed:
            session.revives_used,
          createRequestId:
            createOfflineRevivalRequestId,
          markPending:
            markOfflineRevivalPending,
          applyRevival:
            purchaseOfflineRevival,
        });

      sessionRef.current = {
        userId,
        gameKey,
        sessionId:
          session.session_id,
        startRequestId:
          result.request_id,
      };

      coordinatorRef.current =
        coordinator;

      pendingReadyRef.current = false;

      setPendingReady(false);
      pendingResultRef.current = null;
      reviveUnknownRef.current = false;
      finalizeUnknownRef.current = false;

      setRevivesUsed(0);
      setStatus("active");

      void refreshBalance();

      return true;
    } catch (error) {
      setMessage(
        error?.message ||
        "Không thể xác minh phiên chơi."
      );

      return false;
    } finally {
      startBusyRef.current = false;
    }
  }, [gameKey, refreshBalance]);

  /*
   * CING FREE START PREWARM
   */
  useEffect(() => {
    const timer =
      window.setTimeout(() => {
        if (
          sessionRef.current ||
          startBusyRef.current ||
          mutationBusyRef.current
        ) {
          return;
        }

        void start();
      }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [start]);


  const pending = useCallback(
    async ({
      reason,
      score,
      bestCombo,
    }) => {
      /*
       * Tower and Rush report their actual
       * score at the pending boundary.
       */
      if (
        !Number.isSafeInteger(score) ||
        score < 0 ||
        !Number.isSafeInteger(bestCombo) ||
        bestCombo < 0
      ) {
        fail(
          "Kết quả trận chơi không hợp lệ."
        );
      }

      const previous =
        pendingResultRef.current;

      if (
        previous &&
        (
          previous.score !== score ||
          previous.bestCombo !== bestCombo
        )
      ) {
        fail(
          "Kết quả chờ hồi sinh không khớp."
        );
      }

      pendingResultRef.current = {
        score,
        bestCombo,
      };

      const coordinator =
        coordinatorRef.current;

      if (
        !coordinator ||
        reason !== (
          gameKey === "cing-stack-tower"
            ? "timeout"
            : "death"
        )
      ) {
        fail(
          "Phiên hồi sinh không hợp lệ."
        );
      }

      pendingReadyRef.current = false;

      setPendingReady(false);
      setStatus("pending");
      setMessage("");

      try {
        const result =
          await coordinator.enterPending(
            reason
          );

        if (
          result.status !== "pending" &&
          result.status !==
            "already_pending"
        ) {
          fail(
            "Chưa thể xác minh trạng thái hồi sinh."
          );
        }

        pendingReadyRef.current = true;

        setPendingReady(true);

        setRevivesUsed(
          result.state.revives_used
        );

        void refreshBalance();

        return result;
      } catch (error) {
        setMessage(
          error?.message ||
          "Không xác minh được phiên hồi sinh."
        );

        throw error;
      }
    },
    [gameKey, refreshBalance]
  );

  const retryPending =
    useCallback(async () => {
      if (
        mutationBusyRef.current ||
        reviveUnknownRef.current
      ) {
        return;
      }

      const coordinator =
        coordinatorRef.current;

      if (!coordinator) return;

      const snapshot =
        coordinator.snapshot();

      if (
        snapshot.status ===
        "revive_pending"
      ) {
        pendingReadyRef.current = true;
        setPendingReady(true);
        setMessage("");
        return;
      }

      const result =
        pendingResultRef.current;

      if (
        !result ||
        !Number.isSafeInteger(result.score) ||
        !Number.isSafeInteger(result.bestCombo) ||
        result.score < 0 ||
        result.bestCombo < 0
      ) {
        setMessage(
          "Không còn đủ kết quả trận chơi " +
          "để xác minh an toàn."
        );

        return;
      }

      try {
        await pending({
          reason:
            gameKey === "cing-stack-tower"
              ? "timeout"
              : "death",
          score: result.score,
          bestCombo: result.bestCombo,
        });
      } catch {
        // Preserve the original durable pending request.
      }
    }, [gameKey, pending]);

  const revive =
    useCallback(async (
      retryUnknown = false
    ) => {
      if (
        mutationBusyRef.current ||
        !pendingReadyRef.current ||
        finalizeUnknownRef.current ||
        (
          reviveUnknownRef.current &&
          !retryUnknown
        )
      ) {
        return;
      }

      const coordinator =
        coordinatorRef.current;

      if (!coordinator) return;

      mutationBusyRef.current = true;
      setBusy(true);
      setMessage("");

      try {
        const result =
          await coordinator.revive();

        if (
          result.status !== "resumed" ||
          result.state.status !==
            "active"
        ) {
          fail(
            "Chưa nhận được xác nhận hồi sinh."
          );
        }

        pendingReadyRef.current = false;

        setPendingReady(false);
        pendingResultRef.current = null;
        reviveUnknownRef.current = false;

        setRevivesUsed(
          result.state.revives_used
        );

        setResumeToken(
          value => value + 1
        );

        setStatus("active");
        void refreshBalance();
      } catch (error) {
        /*
         * A debit may already have committed.
         * Do not allow a competing finalize.
         */
        reviveUnknownRef.current = true;

        setMessage(
          "Giao dịch hồi sinh chưa rõ kết quả. " +
          "Giữ nguyên phiên, không gửi lại " +
          "một giao dịch mới."
        );
      } finally {
        mutationBusyRef.current = false;
        setBusy(false);
      }
    }, [refreshBalance]);

  const finalize =
    useCallback(async ({
      score,
      bestCombo,
    }) => {
      const session =
        sessionRef.current;

      const coordinator =
        coordinatorRef.current;

      if (
        !session ||
        !coordinator ||
        reviveUnknownRef.current ||
        mutationBusyRef.current
      ) {
        fail(
          "Phiên đang chờ xác minh hồi sinh."
        );
      }

      const snapshot =
        coordinator.snapshot();

      if (
        snapshot.status !==
        "revive_pending"
      ) {
        fail(
          "Phiên chưa được xác nhận hết giờ."
        );
      }

      const storage =
        window.localStorage;

      const intent =
        ensureFinalizeIntent({
          storage,
          gameKey,
          userId:
            session.userId,
          sessionId:
            session.sessionId,
          startRequestId:
            session.startRequestId,
          eventSeq:
            snapshot.event_seq,
          score,
          bestCombo,
        });

      finalizeUnknownRef.current = true;
      mutationBusyRef.current = true;
      setBusy(true);
      setMessage("Đang lưu kết quả...");

      try {
        const profile =
          useAuthStore.getState()
            .profile || {};

        const receipt =
          await finalizeOfflineRevivalSession({
            sessionId:
              session.sessionId,
            requestId:
              intent.request_id,
            expectedEventSeq:
              snapshot.event_seq,
            finalScore:
              score,
            finalBestCombo:
              bestCombo,
            playerName:
              profile.name ||
              "Cing iu",
            avatar:
              profile.avatar ||
              "",
          });

        if (
          receipt.session_status !==
          "finalized" ||
          receipt.session_id !==
            session.sessionId
        ) {
          fail(
            "Biên nhận kết thúc không hợp lệ."
          );
        }

        completeFinalizedIntent({
          storage,
          gameKey,
          userId:
            session.userId,
          intent,
        });

        sessionRef.current = null;
        coordinatorRef.current = null;
        pendingReadyRef.current = false;
        setPendingReady(false);
        pendingResultRef.current = null;
        finalizeUnknownRef.current = false;

        setFinalResult({
          score:
            Math.max(
              0,
              Number(intent.score) || 0
            ),

          bestCombo:
            Math.max(
              0,
              Number(intent.best_combo) || 0
            ),

        });

        setStatus("finalized");
        setMessage("Đã lưu kết quả thành công.");

        return receipt;
      } finally {
        mutationBusyRef.current = false;
        setBusy(false);
      }
    }, [gameKey]);

  const recoverFinalize =
    useCallback(async () => {
      if (
        mutationBusyRef.current ||
        sessionRef.current
      ) {
        return;
      }

      const userId = memberPhone();

      if (!userId) {
        setMessage(
          "Không xác định được thành viên."
        );
        return;
      }

      mutationBusyRef.current = true;
      setBusy(true);

      try {
        const storage =
          window.localStorage;

        const intent =
          readFinalizeIntent({
            storage,
            gameKey,
            userId,
          });

        if (!intent) {
          fail(
            "Không tìm thấy yêu cầu " +
            "lưu điểm cần xác minh."
          );
        }

        const profile =
          useAuthStore.getState()
            .profile || {};

        /*
         * Replay the original terminal ID,
         * event sequence and final result.
         */
        const receipt =
          await finalizeOfflineRevivalSession({
            sessionId:
              intent.session_id,
            requestId:
              intent.request_id,
            expectedEventSeq:
              intent.event_seq,
            finalScore:
              intent.score,
            finalBestCombo:
              intent.best_combo,
            playerName:
              profile.name ||
              "Cing iu",
            avatar:
              profile.avatar ||
              "",
          });

        if (
          receipt?.session_status !==
            "finalized" ||
          receipt?.session_id !==
            intent.session_id
        ) {
          fail(
            "Biên nhận kết thúc " +
            "chưa được xác minh."
          );
        }

        completeFinalizedIntent({
          storage,
          gameKey,
          userId,
          intent,
        });

        finalizeUnknownRef.current = false;

        setStatus("finalized");
        setMessage("");
      } catch (error) {
        /*
         * Preserve both the terminal
         * request and the start fence.
         */
        setStatus(
          "recovery_required"
        );

        setMessage(
          error?.message ||
          "Chưa xác minh được kết quả " +
          "trận trước. Hãy thử lại."
        );
      } finally {
        mutationBusyRef.current = false;
        setBusy(false);
      }
    }, [gameKey]);

  const playAnotherRound =
    useCallback(() => {
      if (
        busy ||
        status !== "finalized"
      ) {
        return;
      }

      /*
       * The previous authoritative session has
       * already been finalized.
       *
       * This resets LOCAL round state only.
       * The next tap creates/attaches a brand-new
       * free backend session.
       */
      sessionRef.current = null;
      coordinatorRef.current = null;

      startBusyRef.current = false;
      mutationBusyRef.current = false;

      pendingReadyRef.current = false;
      pendingResultRef.current = null;

      reviveUnknownRef.current = false;
      finalizeUnknownRef.current = false;

      setPendingReady(false);
      setRevivesUsed(0);
      setResumeToken(0);

      setFinalResult(null);
      setMessage("");
      setBusy(false);
      setStatus("idle");

      setRoundKey(
        current => current + 1
      );
    }, [
      busy,
      status,
    ]);

  const nextCost =
    revivesUsed < 5
      ? 2 ** revivesUsed
      : null;

  const canRevive =
    status === "pending" &&
    pendingReady &&
    !reviveUnknownRef.current &&
    !finalizeUnknownRef.current &&
    nextCost !== null &&
    creditBalance !== null &&
    creditBalance >= nextCost &&
    !busy;

  return (
    <>
      <GameComp
        key={`${gameKey}:${roundKey}`}
        onExit={() => {
          if (
            sessionRef.current &&
            status !== "finalized"
          ) {
            setMessage(
              "Hãy hoàn tất phiên chơi trước khi thoát."
            );

            return;
          }

          onExit?.();
        }}
        onShowLeaderboard={
          onShowLeaderboard
        }
        onGameStart={start}
        onGameOver={() => {
          /*
           * No legacy score submission
           * in the V2 authoritative path.
           */
        }}
        onRestart={() => true}
        onChallengeProgress={
          onChallengeProgress
        }
        onRevivalPending={pending}
        onRevivalFinalize={finalize}
        revivalMode={true}
        resumeToken={resumeToken}
      />

      {status ===
        "recovery_required" && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 12000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#170d08",
            padding: 20,
          }}
        >
          <div
            style={{
              width:
                "min(380px, 100%)",
              padding: 24,
              borderRadius: 22,
              background: "#fff7ea",
              boxShadow:
                "0 24px 80px rgba(0,0,0,.38)",
              border:
                "1px solid rgba(116,65,33,.14)",
              color: "#2b160b",
              textAlign: "center",
            }}
          >
            <h2>
              Xác minh trận chơi trước
            </h2>

            <p role="alert">
              {message}
            </p>

            <button
              type="button"
              disabled={busy}
              onClick={recoverFinalize}
            >
              {busy
                ? "Đang xác minh..."
                : "Xác minh và lưu kết quả cũ"}
            </button>
          </div>
        </div>
      )}

      {status === "pending" && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 12000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#170d08",
            padding: 20,
          }}
        >
          <div
            style={{
              width:
                "min(380px, 100%)",
              borderRadius: 22,
              padding: 24,
              background:
                "#fff3df",
              color: "#2b160b",
              textAlign: "center",
            }}
          >
            <h2>
              {gameKey ===
              "cing-stack-tower"
                ? "Hết giờ!"
                : "Cần hồi sinh để tiếp tục!"}
            </h2>

            <p>
              Số dư:{" "}
              <b>
                {creditBalance === null
                  ? "Chưa xác minh"
                  : creditBalance}
              </b>{" "}
              Revive Credit
            </p>

            <p>
              {nextCost === null
                ? "Đã sử dụng đủ 5 lần hồi sinh."
                : `Lần hồi sinh tiếp theo: ${nextCost} Credit`}
            </p>

            {message && (
              <p role="alert">
                {message}
              </p>
            )}

            {!pendingReady && (
              <button
                type="button"
                disabled={busy}
                onClick={retryPending}
                style={REVIVAL_SECONDARY_ACTION_STYLE}
              >
                Xác minh phiên
              </button>
            )}

            <button
              type="button"
              disabled={!canRevive}
              onClick={() => revive(false)}
              style={{
                ...REVIVAL_PRIMARY_ACTION_STYLE,
                opacity: canRevive ? 1 : 0.48,
              }}
            >
              {busy
                ? "Đang xác minh..."
                : "Dùng Revive Credit"}
            </button>

            {reviveUnknownRef.current &&
              !finalizeUnknownRef.current && (
              <button
                type="button"
                disabled={busy}
                onClick={() => revive(true)}
                style={REVIVAL_SECONDARY_ACTION_STYLE}
              >
                Xác minh giao dịch hồi sinh cũ
              </button>
            )}

            {creditBalance !== null &&
              nextCost !== null &&
              creditBalance < nextCost &&
              pendingReady &&
              !reviveUnknownRef.current &&
              !finalizeUnknownRef.current && (
              <ReviveCreditPurchaseV2
                userId={memberPhone()}
                requiredQuantity={
                  nextCost - creditBalance
                }
                onPurchased={receipt => {
                  setCreditBalance(
                    receipt.credit_balance_after
                  );
                  void refreshBalance();
                }}
              />
            )}

            {creditBalance !== null &&
              nextCost !== null &&
              creditBalance < nextCost && (
              <p>
                Bạn cần thêm{" "}
                {nextCost -
                  creditBalance}{" "}
                Credit để hồi sinh.
              </p>
            )}

            <button
              type="button"
              disabled={
                busy ||
                status !== "pending" ||
                reviveUnknownRef.current ||
                !pendingResultRef.current
              }
              style={REVIVAL_SECONDARY_ACTION_STYLE}
              onClick={() => {
                const result =
                  pendingResultRef.current;

                if (!result) return;

                void finalize({
                  score: result.score,
                  bestCombo: result.bestCombo,
                }).catch(error => {
                  setMessage(
                    error?.message ||
                    "Chưa xác minh được kết quả. " +
                    "Hãy thử lại cùng yêu cầu."
                  );
                });
              }}
            >
              {finalizeUnknownRef.current
                ? "Xác minh yêu cầu lưu điểm"
                : "Kết thúc và lưu điểm"}
            </button>
          </div>
        </div>
      )}

      {status === "finalized" && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 12000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding:
              "max(20px, env(safe-area-inset-top)) 18px max(24px, env(safe-area-inset-bottom))",
            background:
              "linear-gradient(180deg, rgba(66,34,17,.58), rgba(44,22,11,.72))",
            backdropFilter:
              "blur(8px)",
            WebkitBackdropFilter:
              "blur(8px)",
          }}
        >
          <div
            style={{
              width: "min(400px, 100%)",
              padding: "26px 20px 20px",
              borderRadius: 28,
              background:
                "linear-gradient(180deg,#fffaf2 0%,#ffeed8 100%)",
              border:
                "1px solid rgba(124,67,33,.14)",
              boxShadow:
                "0 28px 90px rgba(31,14,6,.32)",
              color: "#35190d",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 62,
                height: 62,
                margin: "0 auto 13px",
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                background:
                  "linear-gradient(135deg,#ffb43c,#f56526)",
                color: "#fff",
                fontSize: 30,
                fontWeight: 950,
                boxShadow:
                  "0 12px 30px rgba(224,92,29,.27)",
              }}
            >
              ✓
            </div>

            <div
              style={{
                color: "#a3582d",
                fontSize: 12,
                fontWeight: 950,
                letterSpacing: ".09em",
                textTransform: "uppercase",
              }}
            >
              Thành tích đã lưu
            </div>

            <h2
              style={{
                margin: "7px 0 5px",
                fontSize: 27,
                lineHeight: 1.12,
                fontWeight: 950,
              }}
            >
              {gameKey === "cing-stack-tower"
                ? "Xếp Tháp Cing"
                : "Bay cùng trân châu"}
            </h2>

            <div
              style={{
                marginBottom: 18,
                color: "#7d553c",
                fontSize: 14,
                lineHeight: 1.45,
              }}
            >
              Chơi tiếp để nâng thành tích
              bảng xếp hạng
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(2,minmax(0,1fr))",
                gap: 9,
                marginBottom: 19,
              }}
            >
              {[
                [
                  "ĐIỂM",
                  finalResult?.score ?? 0,
                ],
                [
                  "COMBO",
                  finalResult?.bestCombo ?? 0,
                ],
              ].map(
                ([label, value]) => (
                  <div
                    key={label}
                    style={{
                      padding:
                        "13px 6px 12px",
                      borderRadius: 16,
                      background:
                        "rgba(255,255,255,.72)",
                      border:
                        "1px solid rgba(115,61,31,.08)",
                    }}
                  >
                    <div
                      style={{
                        color: "#9a6849",
                        fontSize: 10,
                        fontWeight: 900,
                        letterSpacing:
                          ".06em",
                      }}
                    >
                      {label}
                    </div>

                    <div
                      style={{
                        marginTop: 3,
                        fontSize: 21,
                        fontWeight: 950,
                      }}
                    >
                      {value}
                    </div>
                  </div>
                )
              )}
            </div>

            <button
              type="button"
              onClick={playAnotherRound}
              style={{
                width: "100%",
                minHeight: 55,
                border: 0,
                borderRadius: 17,
                background:
                  "linear-gradient(135deg,#df4e19,#ff7b32)",
                color: "#fff",
                fontSize: 17,
                fontWeight: 950,
                boxShadow:
                  "0 12px 28px rgba(211,73,21,.24)",
              }}
            >
              Chơi ván mới
            </button>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "1fr 1fr",
                gap: 10,
                marginTop: 10,
              }}
            >
              <button
                type="button"
                onClick={() =>
                  onShowLeaderboard?.()
                }
                style={{
                  minHeight: 46,
                  borderRadius: 15,
                  border:
                    "1px solid rgba(88,45,25,.14)",
                  background: "#fffaf3",
                  color: "#4b2817",
                  fontWeight: 850,
                }}
              >
                🏆 Bảng xếp hạng
              </button>

              <button
                type="button"
                onClick={() =>
                  onExit?.()
                }
                style={{
                  minHeight: 46,
                  borderRadius: 15,
                  border:
                    "1px solid rgba(88,45,25,.14)",
                  background: "#fffaf3",
                  color: "#4b2817",
                  fontWeight: 850,
                }}
              >
                Game Center
              </button>
            </div>
          </div>
        </div>
      )}

      {message &&
        status !== "pending" &&
        status !== "finalized" && (
        <div
          role="alert"
          style={{
            position: "fixed",
            bottom: 24,
            left: 20,
            right: 20,
            zIndex: 12001,
            padding: 16,
            borderRadius: 14,
            background: "#fff7ea",
              boxShadow:
                "0 24px 80px rgba(0,0,0,.38)",
              border:
                "1px solid rgba(116,65,33,.14)",
            color: "#2b160b",
          }}
        >
          {message}
        </div>
      )}
    </>
  );
}
