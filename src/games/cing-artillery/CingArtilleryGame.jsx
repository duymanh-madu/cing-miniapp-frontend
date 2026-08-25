import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  createCingArtilleryGameplaySession,
  enterCingArtilleryMatchmaking,
  getCingArtilleryEntry,
} from "./runtime/cingArtilleryAuthorityClient";

import {
  createCingArtilleryRealtimeClient,
} from "./runtime/cingArtilleryRealtimeClient";

import {
  createPremiumArtilleryGame,
} from "./engine/createPremiumArtilleryGame";

import {
  destroyPremiumArtilleryGame,
} from "./engine/destroyPremiumArtilleryGame";

import {
  SNAPSHOT_EVENT,
} from "./scenes/BattleScene";

import {
  isCingArtilleryLandscapeViewport,
  requestCingArtilleryLandscapeMode,
} from "./runtime/cingArtilleryLandscapeMode";

import "./CingArtilleryGame.css";

const MATCHMAKING_POLL_MS =
  1200;

const PHASE =
  Object.freeze({
    CHECKING:
      "checking",

    READY:
      "ready",

    SESSION:
      "session",

    MATCHMAKING:
      "matchmaking",

    CONNECTING:
      "connecting",

    WAITING_REALTIME:
      "waiting-realtime",

    BATTLE_READY:
      "battle-ready",

    UNAVAILABLE:
      "unavailable",

    ONBOARDING:
      "onboarding",

    ERROR:
      "error",
  });

function delay(
  milliseconds
) {
  return new Promise(
    (resolve) =>
      window.setTimeout(
        resolve,
        milliseconds
      )
  );
}

function phaseStep(
  phase
) {
  if (
    phase === PHASE.SESSION ||
    phase === PHASE.MATCHMAKING
  ) {
    return 1;
  }

  if (
    phase === PHASE.CONNECTING ||
    phase === PHASE.WAITING_REALTIME
  ) {
    return 2;
  }

  if (
    phase === PHASE.BATTLE_READY
  ) {
    return 3;
  }

  return 0;
}

function statusFor(
  phase,
  readiness
) {
  switch (phase) {
    case PHASE.CHECKING:
      return {
        icon: "◌",
        title:
          "Đang xác thực quyền truy cập",
        text:
          "Kiểm tra private-beta authority của tài khoản.",
      };

    case PHASE.READY:
      return {
        icon: "⚔",
        title:
          "Sẵn sàng chiến đấu",
        text:
          "Tìm một đối thủ thật và bắt đầu trận PvP realtime.",
      };

    case PHASE.SESSION:
      return {
        icon: "◆",
        title:
          "Đang mở phiên chiến đấu",
        text:
          "PostgreSQL đang thiết lập gameplay session của bạn.",
      };

    case PHASE.MATCHMAKING:
      return {
        icon: "⌁",
        title:
          "Đang tìm đối thủ",
        text:
          "Ghép cặp trực tiếp trên authority production.",
      };

    case PHASE.CONNECTING:
      return {
        icon: "↯",
        title:
          "Đã tìm thấy đối thủ",
        text:
          "Đang kết nối realtime tới máy chủ Mắt Bão.",
      };

    case PHASE.WAITING_REALTIME:
      return {
        icon: "◎",
        title:
          readiness?.both
            ? "Cả hai đã sẵn sàng"
            : "Đang chờ đối thủ vào trận",
        text:
          readiness?.both
            ? "Máy chủ đang kích hoạt turn authority."
            : "Room đã được xác thực. Trận bắt đầu khi đủ hai người.",
      };

    case PHASE.BATTLE_READY:
      return {
        icon: "✦",
        title:
          "Trận đấu đã sẵn sàng",
        text:
          "Realtime authority đã kích hoạt. Battle Scene sẽ nhận trạng thái này ở 5J3.",
      };

    case PHASE.ONBOARDING:
      return {
        icon: "◇",
        title:
          "Cần tạo nhân vật",
        text:
          "Tài khoản đã có quyền private beta nhưng chưa hoàn tất hồ sơ chiến binh.",
      };

    case PHASE.UNAVAILABLE:
      return {
        icon: "⊘",
        title:
          "Cing Piu Piu chưa khả dụng",
        text:
          "Tài khoản này hiện chưa thuộc nhóm thử nghiệm.",
      };

    case PHASE.ERROR:
    default:
      return {
        icon: "!",
        title:
          "Không thể vào trận",
        text:
          "Authority đã chặn một bước không hợp lệ. Không có gameplay state nào được client tự sửa.",
      };
  }
}

export default function
CingArtilleryGame({
  onExit,
}) {
  const aliveRef =
    useRef(true);

  const runRef =
    useRef(0);

  const realtimeRef =
    useRef(null);

  const battleMountRef =
    useRef(null);

  const battleGameRef =
    useRef(null);

  const [phase, setPhase] =
    useState(
      PHASE.CHECKING
    );

  const [entry, setEntry] =
    useState(null);

  const [session, setSession] =
    useState(null);

  const [decision, setDecision] =
    useState(null);

  const [joinAuthority, setJoinAuthority] =
    useState(null);

  const [readiness, setReadiness] =
    useState(null);

  const [turnState, setTurnState] =
    useState(null);

  const [battleSnapshot, setBattleSnapshot] =
    useState(null);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [
    landscapeReady,
    setLandscapeReady,
  ] =
    useState(
      () =>
        isCingArtilleryLandscapeViewport()
    );

  useEffect(
    () => {
      const syncLandscape =
        () => {
          const next =
            isCingArtilleryLandscapeViewport();

          setLandscapeReady(
            next
          );

          window
            .requestAnimationFrame(
              () => {
                battleGameRef
                  .current
                  ?.scale
                  ?.refresh?.();
              }
            );
        };

      syncLandscape();

      window.addEventListener(
        "resize",
        syncLandscape,
        {
          passive: true,
        }
      );

      window.addEventListener(
        "orientationchange",
        syncLandscape,
        {
          passive: true,
        }
      );

      window.visualViewport
        ?.addEventListener(
          "resize",
          syncLandscape,
          {
            passive: true,
          }
        );

      return () => {
        window.removeEventListener(
          "resize",
          syncLandscape
        );

        window.removeEventListener(
          "orientationchange",
          syncLandscape
        );

        window.visualViewport
          ?.removeEventListener(
            "resize",
            syncLandscape
          );
      };
    },
    []
  );

  useEffect(
    () => {
      aliveRef.current =
        true;

      const runId =
        ++runRef.current;

      void (async () => {
        try {
          const value =
            await getCingArtilleryEntry();

          if (
            !aliveRef.current ||
            runId !==
              runRef.current
          ) {
            return;
          }

          setEntry(
            value
          );

          if (
            value?.ready ===
              true &&
            value?.state ===
              "ready"
          ) {
            setPhase(
              PHASE.READY
            );

            return;
          }

          if (
            value
              ?.onboarding_required ===
              true
          ) {
            setPhase(
              PHASE.ONBOARDING
            );

            return;
          }

          setPhase(
            PHASE.UNAVAILABLE
          );
        } catch (error) {
          if (
            !aliveRef.current ||
            runId !==
              runRef.current
          ) {
            return;
          }

          setErrorMessage(
            error?.response
              ?.data?.message ||
            error?.message ||
            "Không thể kiểm tra quyền truy cập"
          );

          setPhase(
            PHASE.UNAVAILABLE
          );
        }
      })();

      return () => {
        aliveRef.current =
          false;

        runRef.current +=
          1;

        const realtime =
          realtimeRef.current;

        realtimeRef.current =
          null;

        if (realtime) {
          void realtime.destroy();
        }

        const battleGame =
          battleGameRef.current;

        battleGameRef.current =
          null;

        if (battleGame) {
          destroyPremiumArtilleryGame(
            battleGame
          );
        }
      };
    },
    []
  );

  useEffect(
    () => {
      const combatStateId =
        battleSnapshot
          ?.combat_state_id;

      if (
        !combatStateId ||
        !battleMountRef.current ||
        battleGameRef.current
      ) {
        return;
      }

      let cancelled =
        false;

      void createPremiumArtilleryGame(
        battleMountRef.current,
        {
          snapshot:
            battleSnapshot,
        }
      )
        .then(
          (game) => {
            if (cancelled) {
              destroyPremiumArtilleryGame(
                game
              );

              return;
            }

            battleGameRef.current =
              game;
          }
        )
        .catch(
          (error) => {
            if (
              !aliveRef.current
            ) {
              return;
            }

            setErrorMessage(
              error?.message ||
              "Không thể dựng Battle Scene Cing Piu Piu"
            );

            setPhase(
              PHASE.ERROR
            );
          }
        );

      return () => {
        cancelled =
          true;

        const game =
          battleGameRef.current;

        battleGameRef.current =
          null;

        if (game) {
          destroyPremiumArtilleryGame(
            game
          );
        }
      };
    },
    [
      battleSnapshot
        ?.combat_state_id,
    ]
  );

  useEffect(
    () => {
      const game =
        battleGameRef.current;

      if (
        !game ||
        !battleSnapshot
      ) {
        return;
      }

      game.events.emit(
        SNAPSHOT_EVENT,
        battleSnapshot
      );
    },
    [
      battleSnapshot,
    ]
  );

  async function
  enterLandscapeBattleMode() {
    await requestCingArtilleryLandscapeMode();

    window.setTimeout(
      () => {
        setLandscapeReady(
          isCingArtilleryLandscapeViewport()
        );

        battleGameRef
          .current
          ?.scale
          ?.refresh?.();
      },
      120
    );
  }

  async function
  startMatchmaking() {
    if (
      phase !== PHASE.READY &&
      phase !== PHASE.ERROR
    ) {
      return;
    }

    const runId =
      ++runRef.current;

    setErrorMessage(
      ""
    );

    setReadiness(
      null
    );

    setTurnState(
      null
    );

    setBattleSnapshot(
      null
    );

    setJoinAuthority(
      null
    );

    try {
      setPhase(
        PHASE.SESSION
      );

      const currentSession =
        await createCingArtilleryGameplaySession();

      if (
        !aliveRef.current ||
        runId !==
          runRef.current
      ) {
        return;
      }

      setSession(
        currentSession
      );

      setPhase(
        PHASE.MATCHMAKING
      );

      let matchDecision =
        null;

      while (
        aliveRef.current &&
        runId ===
          runRef.current
      ) {
        matchDecision =
          await enterCingArtilleryMatchmaking(
            currentSession.id
          );

        if (
          !aliveRef.current ||
          runId !==
            runRef.current
        ) {
          return;
        }

        setDecision(
          matchDecision
        );

        if (
          matchDecision.status ===
            "matched"
        ) {
          break;
        }

        await delay(
          MATCHMAKING_POLL_MS
        );
      }

      if (
        !matchDecision?.match_id ||
        !aliveRef.current ||
        runId !==
          runRef.current
      ) {
        return;
      }

      setPhase(
        PHASE.CONNECTING
      );

      const previousRealtime =
        realtimeRef.current;

      if (previousRealtime) {
        await previousRealtime
          .destroy();
      }

      const realtime =
        createCingArtilleryRealtimeClient({
          onReadiness:
            (value) => {
              if (
                !aliveRef.current ||
                runId !==
                  runRef.current ||
                value?.match_id !==
                  matchDecision.match_id
              ) {
                return;
              }

              setReadiness(
                value
              );

              setPhase(
                PHASE.WAITING_REALTIME
              );
            },

          onTurnState:
            (value) => {
              if (
                !aliveRef.current ||
                runId !==
                  runRef.current ||
                value?.match_id !==
                  matchDecision.match_id
              ) {
                return;
              }

              setTurnState(
                value
              );

              void realtime
                .readBattleSnapshot(
                  matchDecision.match_id
                )
                .then(
                  (snapshot) => {
                    if (
                      !aliveRef.current ||
                      runId !==
                        runRef.current
                    ) {
                      return;
                    }

                    setBattleSnapshot(
                      snapshot
                    );

                    setTurnState(
                      snapshot.turn
                    );

                    setPhase(
                      PHASE.BATTLE_READY
                    );
                  }
                )
                .catch(
                  (error) => {
                    if (
                      !aliveRef.current ||
                      runId !==
                        runRef.current
                    ) {
                      return;
                    }

                    setErrorMessage(
                      error?.message ||
                      "Không thể đọc battle snapshot Cing Piu Piu"
                    );

                    setPhase(
                      PHASE.ERROR
                    );
                  }
                );
            },

          onStartError:
            (value) => {
              if (
                !aliveRef.current ||
                runId !==
                  runRef.current ||
                value?.match_id !==
                  matchDecision.match_id
              ) {
                return;
              }

              setErrorMessage(
                value?.error?.message ||
                "Máy chủ không thể kích hoạt trận đấu"
              );

              setPhase(
                PHASE.ERROR
              );
            },

          onBattleSnapshot:
            (snapshot) => {
              if (
                !aliveRef.current ||
                runId !==
                  runRef.current ||
                snapshot?.match_id !==
                  matchDecision.match_id
              ) {
                return;
              }

              setBattleSnapshot(
                snapshot
              );

              setTurnState(
                snapshot.turn
              );

              setPhase(
                PHASE.BATTLE_READY
              );
            },

          onRecovered:
            (authority) => {
              if (
                !aliveRef.current ||
                runId !==
                  runRef.current ||
                authority?.match_id !==
                  matchDecision.match_id
              ) {
                return;
              }

              setJoinAuthority(
                authority
              );

              setReadiness(
                authority.readiness ||
                null
              );
            },

          onDisconnected:
            () => {
              if (
                !aliveRef.current ||
                runId !==
                  runRef.current
              ) {
                return;
              }

              /*
               * Socket.IO owns reconnect.
               * Durable match/session state is not
               * rewritten by transport disconnect.
               */
            },
        });

      realtimeRef.current =
        realtime;

      const authority =
        await realtime.joinMatch(
          matchDecision.match_id
        );

      if (
        !aliveRef.current ||
        runId !==
          runRef.current
      ) {
        await realtime.destroy();

        return;
      }

      setJoinAuthority(
        authority
      );

      setReadiness(
        authority.readiness ||
        null
      );

      setPhase(
        authority.readiness?.both
          ? PHASE.WAITING_REALTIME
          : PHASE.WAITING_REALTIME
      );
    } catch (error) {
      if (
        !aliveRef.current ||
        runId !==
          runRef.current
      ) {
        return;
      }

      setErrorMessage(
        error?.response
          ?.data?.message ||
        error?.message ||
        "Không thể bắt đầu Cing Piu Piu"
      );

      setPhase(
        PHASE.ERROR
      );
    }
  }

  const status =
    statusFor(
      phase,
      readiness
    );

  const step =
    phaseStep(
      phase
    );

  const busy =
    phase ===
      PHASE.CHECKING ||
    phase ===
      PHASE.SESSION ||
    phase ===
      PHASE.MATCHMAKING ||
    phase ===
      PHASE.CONNECTING ||
    phase ===
      PHASE.WAITING_REALTIME;

  const canStart =
    phase ===
      PHASE.READY ||
    phase ===
      PHASE.ERROR;

  if (
    battleSnapshot &&
    phase ===
      PHASE.BATTLE_READY
  ) {
    return (
      <div
        className={
          `cing-piu-piu cing-piu-piu--battle ${
            landscapeReady
              ? "cing-piu-piu--landscape-ready"
              : "cing-piu-piu--portrait-blocked"
          }`
        }
      >
        <div
          className="cing-piu-piu__battle-shell"
        >
          {!landscapeReady && (
            <div
              className="cing-piu-piu__orientation-gate"
              role="dialog"
              aria-modal="true"
              aria-label="Chuyển Cing Piu Piu sang màn hình ngang"
            >
              <div
                className="cing-piu-piu__orientation-card"
              >
                <div
                  className="cing-piu-piu__orientation-device"
                  aria-hidden="true"
                >
                  ↻
                </div>

                <p
                  className="cing-piu-piu__orientation-kicker"
                >
                  BATTLE MODE · 16:9
                </p>

                <h2>
                  Xoay ngang để chiến đấu
                </h2>

                <p>
                  Cing Piu Piu được thiết kế theo
                  màn hình ngang để giữ trọn bản đồ,
                  HUD và không gian ngắm bắn.
                </p>

                <button
                  type="button"
                  className="cing-piu-piu__orientation-button"
                  onClick={
                    enterLandscapeBattleMode
                  }
                >
                  Thử chuyển sang ngang
                </button>

                <small>
                  Nếu Zalo không cho phép tự xoay,
                  hãy bật xoay màn hình và xoay ngang điện thoại.
                </small>
              </div>
            </div>
          )}

          <div
            className="cing-piu-piu__battle-topbar"
          >
            <button
              type="button"
              className="cing-piu-piu__back"
              aria-label="Rời trận đấu"
              onClick={() =>
                onExit?.()
              }
            >
              ‹
            </button>

            <div
              className="cing-piu-piu__battle-brand"
            >
              <span>
                CING PIU PIU
              </span>

              <small>
                PRIVATE BETA · REALTIME
              </small>
            </div>

            <div
              className="cing-piu-piu__battle-live"
            >
              LIVE
            </div>
          </div>

          <div
            className="cing-piu-piu__battle-stage"
          >
            <div
              ref={battleMountRef}
              className="cing-piu-piu__battle-canvas"
            />
          </div>

          <div
            className="cing-piu-piu__battle-authority"
          >
            <span>
              PostgreSQL authority
            </span>

            <span>
              Match {battleSnapshot.match_id}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="cing-piu-piu"
    >
      <div
        className="cing-piu-piu__shell"
      >
        <div
          className="cing-piu-piu__topbar"
        >
          <button
            type="button"
            className="cing-piu-piu__back"
            aria-label="Quay lại Game Center"
            onClick={() =>
              onExit?.()
            }
          >
            ‹
          </button>

          <div
            className="cing-piu-piu__beta"
          >
            PRIVATE BETA
          </div>
        </div>

        <section
          className="cing-piu-piu__hero"
        >
          <div
            className={
              `cing-piu-piu__orb${
                busy
                  ? " cing-piu-piu__pulse"
                  : ""
              }`
            }
          />

          <p
            className="cing-piu-piu__eyebrow"
          >
            Cing Hu Tang Kinh Bắc
          </p>

          <h1
            className="cing-piu-piu__title"
          >
            Cing Piu Piu
          </h1>

          <p
            className="cing-piu-piu__subtitle"
          >
            Đối kháng pháo binh 1v1 realtime.
            Góc bắn, lực bắn, gió và địa hình
            quyết định từng phát đạn.
          </p>
        </section>

        <section
          className="cing-piu-piu__card"
        >
          <div
            className="cing-piu-piu__status-row"
          >
            <div
              className="cing-piu-piu__status-icon"
            >
              {status.icon}
            </div>

            <div
              className="cing-piu-piu__status-copy"
            >
              <p
                className="cing-piu-piu__status-title"
              >
                {status.title}
              </p>

              <p
                className="cing-piu-piu__status-text"
              >
                {status.text}
              </p>
            </div>
          </div>

          <div
            className="cing-piu-piu__steps"
            aria-hidden="true"
          >
            {[1, 2, 3].map(
              (value) => (
                <div
                  key={value}
                  className={
                    `cing-piu-piu__step${
                      step >= value
                        ? " cing-piu-piu__step--active"
                        : ""
                    }`
                  }
                />
              )
            )}
          </div>

          {phase === PHASE.READY && (
            <div
              className="cing-piu-piu__features"
            >
              <div
                className="cing-piu-piu__feature"
              >
                ⚡ <strong>Realtime 1v1</strong>
                {" "}trên máy chủ Việt Nam
              </div>

              <div
                className="cing-piu-piu__feature"
              >
                🎯 PostgreSQL giữ toàn bộ
                gameplay authority
              </div>

              <div
                className="cing-piu-piu__feature"
              >
                🛡 Private beta — chưa mở
                cho tài khoản ngoài danh sách
              </div>
            </div>
          )}

          {errorMessage && (
            <p
              className="cing-piu-piu__error"
            >
              {errorMessage}
            </p>
          )}

          {decision?.match_id && (
            <p
              className="cing-piu-piu__match"
            >
              Match {decision.match_id}
              {joinAuthority?.player
                ? ` · ${joinAuthority.player}`
                : ""}
            </p>
          )}

          {turnState && (
            <p
              className="cing-piu-piu__match"
            >
              Turn {turnState.turn_number}
              {" · "}
              authority active
            </p>
          )}
        </section>

        <div
          className="cing-piu-piu__actions"
        >
          <button
            type="button"
            className="cing-piu-piu__primary"
            disabled={
              !canStart
            }
            onClick={
              startMatchmaking
            }
          >
            {phase === PHASE.READY
              ? "Tìm đối thủ"
              : phase === PHASE.ERROR
                ? "Thử kết nối lại"
                : phase === PHASE.BATTLE_READY
                  ? "Trận đấu đã sẵn sàng"
                  : phase === PHASE.ONBOARDING
                    ? "Cần hoàn tất nhân vật"
                    : phase === PHASE.UNAVAILABLE
                      ? "Chưa có quyền thử nghiệm"
                      : "Đang kết nối..."}
          </button>
        </div>
      </div>
    </div>
  );
}
