import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  createCingArtilleryGameplaySession,
  enterCingArtilleryMatchmaking,
  getCingArtilleryEntry,
  requestCingArtilleryRematch,
} from "./runtime/cingArtilleryAuthorityClient";

import {
  createCingArtilleryRealtimeClient,
} from "./runtime/cingArtilleryRealtimeClient";

import {
  createPremiumArtilleryGame,
  presentCanonicalArtilleryResult,
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

const SHOT_ANGLE_MIN_DEG =
  10;

const SHOT_ANGLE_MAX_DEG =
  80;

const SHOT_POWER_MIN =
  0;

const SHOT_POWER_MAX =
  100;

function createShotCommandId() {
  const cryptoApi =
    globalThis.crypto;

  if (
    typeof cryptoApi?.randomUUID ===
    "function"
  ) {
    return cryptoApi.randomUUID();
  }

  if (
    typeof cryptoApi?.getRandomValues !==
    "function"
  ) {
    const error =
      new Error(
        "Thiết bị không hỗ trợ tạo shot command identity an toàn"
      );

    error.code =
      "CING_PIU_PIU_SECURE_UUID_UNAVAILABLE";

    throw error;
  }

  const bytes =
    new Uint8Array(
      16
    );

  cryptoApi.getRandomValues(
    bytes
  );

  bytes[6] =
    (
      bytes[6] &
      0x0f
    ) |
    0x40;

  bytes[8] =
    (
      bytes[8] &
      0x3f
    ) |
    0x80;

  const hex =
    Array.from(
      bytes,
      (value) =>
        value
          .toString(16)
          .padStart(
            2,
            "0"
          )
    );

  return [
    hex.slice(0, 4).join(""),
    hex.slice(4, 6).join(""),
    hex.slice(6, 8).join(""),
    hex.slice(8, 10).join(""),
    hex.slice(10, 16).join(""),
  ].join("-");
}

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

  const battleSnapshotRef =
    useRef(null);

  const shotTurnLockRef =
    useRef(null);

  const battleMatchRef =
    useRef(null);

  const exitLifecycleRef =
    useRef(null);

  const rematchLifecycleRef =
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
      battleSnapshotRef.current =
        battleSnapshot;

      const matchId =
        String(
          battleSnapshot
            ?.match_id ||
          ""
        ).trim();

      if (
        battleMatchRef.current !==
          matchId
      ) {
        battleMatchRef.current =
          matchId;

        shotTurnLockRef.current =
          null;
      }
    },
    [
      battleSnapshot,
    ]
  );

  async function handleBattleFireIntent({
    turnNumber,
    angleDeg,
    power,
  }) {
    const snapshot =
      battleSnapshotRef.current;

    const realtime =
      realtimeRef.current;

    if (
      !snapshot ||
      !realtime
    ) {
      throw new Error(
        "Battle authority Cing Piu Piu chưa sẵn sàng"
      );
    }

    const authoritativeTurnNumber =
      Number(
        snapshot.turn
          ?.turn_number
      );

    if (
      !Number.isInteger(
        authoritativeTurnNumber
      ) ||
      Number(
        turnNumber
      ) !==
        authoritativeTurnNumber
    ) {
      throw new Error(
        "Lượt bắn Cing Piu Piu đã thay đổi"
      );
    }

    if (
      snapshot.turn
        ?.active_account_id !==
      snapshot.viewer
        ?.account_id
    ) {
      throw new Error(
        "Chưa tới lượt của bạn"
      );
    }

    const normalizedAngle =
      Number(
        angleDeg
      );

    const normalizedPower =
      Number(
        power
      );

    if (
      !Number.isFinite(
        normalizedAngle
      ) ||
      normalizedAngle <
        SHOT_ANGLE_MIN_DEG ||
      normalizedAngle >
        SHOT_ANGLE_MAX_DEG
    ) {
      throw new Error(
        "Góc bắn Cing Piu Piu không hợp lệ"
      );
    }

    if (
      !Number.isFinite(
        normalizedPower
      ) ||
      normalizedPower <
        SHOT_POWER_MIN ||
      normalizedPower >
        SHOT_POWER_MAX
    ) {
      throw new Error(
        "Lực bắn Cing Piu Piu không hợp lệ"
      );
    }

    const shotLockKey =
      `${snapshot.match_id}:${authoritativeTurnNumber}`;

    if (
      shotTurnLockRef.current ===
        shotLockKey
    ) {
      throw new Error(
        "Phát bắn của lượt này đã được gửi"
      );
    }

    shotTurnLockRef.current =
      shotLockKey;

    try {
      const shotCommand =
        await realtime.sendShot({
          matchId:
            snapshot.match_id,

          commandId:
            createShotCommandId(),

          turnNumber:
            authoritativeTurnNumber,

          angleDeg:
            normalizedAngle,

          power:
            normalizedPower,
        });

      if (
        !shotCommand?.id ||
        Number(
          shotCommand
            ?.turn_number
        ) !==
          authoritativeTurnNumber
      ) {
        throw new Error(
          "Shot command acknowledgement Cing Piu Piu không hợp lệ"
        );
      }

      /*
       * Durable ACK means only that the command was accepted.
       *
       * Do not mutate HP, position, terrain or turn here.
       * FE-2 waits for canonical durable result and then
       * refreshes the authoritative battle snapshot.
       */
      return shotCommand;
    } catch (error) {
      if (
        shotTurnLockRef.current ===
          shotLockKey
      ) {
        shotTurnLockRef.current =
          null;
      }

      throw error;
    }
  }

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

          onFireIntent:
            handleBattleFireIntent,

          onExitIntent:
            handleExitIntent,

          onRematchIntent:
            handleRematchIntent,
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
  handleExitIntent() {
    if (
      exitLifecycleRef.current
    ) {
      return exitLifecycleRef.current;
    }

    const lifecycle =
      (async () => {
        /*
         * Single frontend owner for battle exit.
         *
         * Invalidate outstanding async work, leave realtime
         * transport, destroy Phaser, then return control to
         * the outer Game Center.
         *
         * No result, winner, rematch or gameplay authority
         * is decided here.
         */
        runRef.current +=
          1;

        shotTurnLockRef.current =
          null;

        const realtime =
          realtimeRef.current;

        realtimeRef.current =
          null;

        const battleGame =
          battleGameRef.current;

        battleGameRef.current =
          null;

        try {
          if (realtime) {
            await realtime.destroy();
          }
        } finally {
          if (battleGame) {
            destroyPremiumArtilleryGame(
              battleGame
            );
          }

          onExit?.();
        }
      })();

    exitLifecycleRef.current =
      lifecycle;

    return lifecycle;
  }

  async function
  handleRematchIntent({
    sourceMatchId,
  } = {}) {
    const sourceId =
      String(
        sourceMatchId ||
        battleMatchRef.current ||
        ""
      ).trim();

    if (!sourceId) {
      throw new Error(
        "Thiếu source match để đấu lại"
      );
    }

    if (
      rematchLifecycleRef.current
    ) {
      return rematchLifecycleRef.current;
    }

    const sourceRunId =
      runRef.current;

    const lifecycle =
      (async () => {
        let transitionStarted =
          false;

        try {
          let rematchDecision =
            null;

          while (
            aliveRef.current &&
            sourceRunId ===
              runRef.current
          ) {
            rematchDecision =
              await requestCingArtilleryRematch(
                sourceId
              );

            if (
              !aliveRef.current ||
              sourceRunId !==
                runRef.current
            ) {
              return null;
            }

            if (
              rematchDecision.status ===
                "matched"
            ) {
              break;
            }

            await delay(
              MATCHMAKING_POLL_MS
            );
          }

          if (
            !aliveRef.current ||
            sourceRunId !==
              runRef.current ||
            rematchDecision?.status !==
              "matched"
          ) {
            return null;
          }

          const nextMatchId =
            String(
              rematchDecision
                .rematch_match_id ||
              ""
            ).trim();

          if (!nextMatchId) {
            throw new Error(
              "Rematch Cing Piu Piu thiếu canonical match mới"
            );
          }

          transitionStarted =
            true;

          const nextRunId =
            ++runRef.current;

          shotTurnLockRef.current =
            null;

          const previousRealtime =
            realtimeRef.current;

          realtimeRef.current =
            null;

          const previousGame =
            battleGameRef.current;

          battleGameRef.current =
            null;

          /*
           * Mutual consent is complete at this point.
           *
           * Only now may the completed source battle be
           * dismantled. Realtime leaves the old match first;
           * Phaser follows. The next realtime client is created
           * by connectCanonicalMatch and therefore owns a fresh
           * durable result cursor starting from zero.
           */
          try {
            if (previousRealtime) {
              await previousRealtime.destroy();
            }
          } finally {
            if (previousGame) {
              destroyPremiumArtilleryGame(
                previousGame
              );
            }
          }

          if (
            !aliveRef.current ||
            nextRunId !==
              runRef.current
          ) {
            return null;
          }

          battleSnapshotRef.current =
            null;

          battleMatchRef.current =
            null;

          setBattleSnapshot(
            null
          );

          setReadiness(
            null
          );

          setTurnState(
            null
          );

          setJoinAuthority(
            null
          );

          const nextDecision =
            Object.freeze({
              status:
                "matched",

              match_id:
                nextMatchId,
            });

          setDecision(
            nextDecision
          );

          await connectCanonicalMatch(
            nextDecision,
            nextRunId
          );

          if (
            !aliveRef.current ||
            nextRunId !==
              runRef.current
          ) {
            return null;
          }

          return Object.freeze({
            status:
              "matched",

            rematch_match_id:
              nextMatchId,
          });
        } catch (error) {
          if (
            transitionStarted &&
            aliveRef.current
          ) {
            setErrorMessage(
              error?.response
                ?.data?.message ||
              error?.message ||
              "Không thể vào trận đấu lại"
            );

            setPhase(
              PHASE.ERROR
            );
          }

          throw error;
        }
      })();

    rematchLifecycleRef.current =
      lifecycle;

    try {
      return await lifecycle;
    } finally {
      if (
        rematchLifecycleRef.current ===
          lifecycle
      ) {
        rematchLifecycleRef.current =
          null;
      }
    }
  }

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
  connectCanonicalMatch(
    matchDecision,
    runId
  ) {
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

        onCanonicalShotResult:
          async (
            canonicalResult
          ) => {
            if (
              !aliveRef.current ||
              runId !==
                runRef.current
            ) {
              throw new Error(
                "Battle lifecycle Cing Piu Piu không còn active"
              );
            }

            const battleGame =
              battleGameRef.current;

            if (!battleGame) {
              throw new Error(
                "Battle renderer Cing Piu Piu chưa sẵn sàng cho canonical result"
              );
            }

            await presentCanonicalArtilleryResult(
              battleGame,
              canonicalResult
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

      await connectCanonicalMatch(
        matchDecision,
        runId
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
              onClick={() => {
                void handleExitIntent();
              }}
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
            onClick={() => {
                void handleExitIntent();
              }}
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
