import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import useAuthStore from
  "../../stores/auth/authStore.js";

import {
  BOARD_SIZE,
  canPlacePiece,
} from "./engine/index.js";

import {
  createBlockPuzzleRequestId,
  startAuthorizedBlockPuzzleSession,
  submitAuthorizedBlockPuzzleReplay,
} from "./runtime/blockPuzzleAuthorityClient.js";

import {
  createAuthorizedBlockPuzzleRuntime,
  recoverAuthorizedBlockPuzzleRuntime,
  applyAuthorizedBlockPuzzleMove,
  applyAuthoritativeBlockPuzzleSubmission,
} from "./runtime/blockPuzzleSessionRuntime.js";

import {
  resolveBoardDropOrigin,
} from "./runtime/blockPuzzleDragGeometry.js";

import {
  persistBlockPuzzlePendingStart,
  persistBlockPuzzleRuntime,
  restoreBlockPuzzleRecovery,
  clearBlockPuzzleRecovery,
  isBlockPuzzleSessionExpired,
} from "./runtime/blockPuzzleRecovery.js";

const PHASE = Object.freeze({
  IDLE: "idle",
  STARTING: "starting",
  PLAYING: "playing",
  SUBMITTING: "submitting",
  SUBMIT_ERROR: "submit_error",
  START_ERROR: "start_error",
  COMPLETE: "complete",
  EXPIRED: "expired",
});

function errorMessage(
  error,
  fallback
) {
  const code =
    error?.response?.data?.code ||
    error?.code ||
    "";

  if (
    code === "NO_GAME_PLAYS"
  ) {
    return "Bạn đã hết lượt chơi.";
  }

  if (
    error?.response?.status ===
    401
  ) {
    return "Phiên đăng nhập đã hết hạn.";
  }

  return (
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
}

function PieceView({
  piece,
  trayIndex,
  disabled,
  onPointerStart,
}) {
  if (!piece) {
    return (
      <div
        aria-hidden="true"
        style={{
          width: 92,
          height: 92,
        }}
      />
    );
  }

  const maxRow =
    Math.max(
      ...piece.cells.map(
        ([row]) => row
      )
    );

  const maxCol =
    Math.max(
      ...piece.cells.map(
        ([, col]) => col
      )
    );

  const occupied =
    new Map(
      piece.cells.map(
        ([row, col]) => [
          `${row}:${col}`,
          [row, col],
        ]
      )
    );

  const cell =
    Math.max(
      15,
      Math.min(
        25,
        Math.floor(
          82 /
          Math.max(
            maxRow + 1,
            maxCol + 1
          )
        )
      )
    );

  return (
    <div
      style={{
        width: 92,
        height: 92,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity:
          disabled ? 0.38 : 1,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            `repeat(${maxCol + 1}, ${cell}px)`,

          gridTemplateRows:
            `repeat(${maxRow + 1}, ${cell}px)`,

          touchAction: "none",
          userSelect: "none",
        }}
      >
        {Array.from(
          {
            length:
              (maxRow + 1) *
              (maxCol + 1),
          },
          (_, index) => {
            const row =
              Math.floor(
                index /
                (maxCol + 1)
              );

            const col =
              index %
              (maxCol + 1);

            const entry =
              occupied.get(
                `${row}:${col}`
              );

            if (!entry) {
              return (
                <div
                  key={`${row}:${col}`}
                />
              );
            }

            return (
              <div
                key={`${row}:${col}`}
                role="button"
                tabIndex={-1}
                onPointerDown={
                  disabled
                    ? undefined
                    : (event) =>
                        onPointerStart(
                          event,
                          trayIndex,
                          row,
                          col
                        )
                }
                style={{
                  width: cell,
                  height: cell,
                  borderRadius:
                    Math.max(
                      4,
                      Math.floor(
                        cell * 0.2
                      )
                    ),
                  background:
                    "linear-gradient(145deg,#ffb25b,#d4531c)",
                  border:
                    "1px solid rgba(255,255,255,0.7)",
                  boxShadow:
                    "inset 0 -3px 0 rgba(90,36,8,0.18), 0 3px 8px rgba(80,30,5,0.18)",
                  cursor: "grab",
                  touchAction: "none",
                }}
              />
            );
          }
        )}
      </div>
    </div>
  );
}

export default function
CingBlockPuzzle({
  onExit,
}) {
  const navigate =
    useNavigate();

  const boardRef =
    useRef(null);

  const runtimeRef =
    useRef(null);

  const requestIdRef =
    useRef(null);

  const submitInFlightRef =
    useRef(false);

  const startInFlightRef =
    useRef(false);

  const mountedRef =
    useRef(true);

  const recoveryInitializedRef =
    useRef(false);

  const recoveryOwnerKey =
    useAuthStore(
      (state) =>
        state.profile?.phone ||
        ""
    );

  const [runtime, setRuntime] =
    useState(null);

  const [phase, setPhase] =
    useState(PHASE.IDLE);

  const [error, setError] =
    useState("");

  const [drag, setDrag] =
    useState(null);

  useEffect(() => {
    mountedRef.current =
      true;

    return () => {
      mountedRef.current =
        false;
    };
  }, []);

  useEffect(() => {
    if (
      recoveryInitializedRef
        .current ||
      !recoveryOwnerKey
    ) {
      return;
    }

    recoveryInitializedRef.current =
      true;

    const recovered =
      restoreBlockPuzzleRecovery({
        ownerKey:
          recoveryOwnerKey,
      });

    if (!recovered) {
      return;
    }

    requestIdRef.current =
      recovered.request_id;

    /*
     * Pending-start recovery:
     * do not create a new idempotency key.
     * User explicitly retries the exact request.
     */
    if (
      !recovered.session ||
      !recovered.replay
    ) {
      setError(
        "Có một yêu cầu tạo ván chưa hoàn tất. Hãy thử lại để tiếp tục đúng ván đó."
      );

      setPhase(
        PHASE.START_ERROR
      );

      return;
    }

    if (
      isBlockPuzzleSessionExpired(
        recovered.session
      )
    ) {
      clearBlockPuzzleRecovery();

      requestIdRef.current =
        null;

      setError(
        "Ván chơi trước đã hết hạn. Bạn có thể bắt đầu một ván mới."
      );

      setPhase(
        PHASE.IDLE
      );

      return;
    }

    try {
      const recoveredRuntime =
        recoverAuthorizedBlockPuzzleRuntime(
          recovered.session,
          recovered.replay
        );

      runtimeRef.current =
        recoveredRuntime;

      setRuntime(
        recoveredRuntime
      );

      setDrag(null);

      if (
        recoveredRuntime.state
          .ended
      ) {
        setError(
          "Ván trước đã kết thúc nhưng kết quả chưa được xác nhận. Hãy gửi lại kết quả."
        );

        setPhase(
          PHASE.SUBMIT_ERROR
        );
      } else {
        setPhase(
          PHASE.PLAYING
        );
      }
    } catch {
      clearBlockPuzzleRecovery();

      runtimeRef.current =
        null;

      requestIdRef.current =
        null;

      setRuntime(null);

      setError(
        "Dữ liệu khôi phục không hợp lệ. Vui lòng bắt đầu ván mới."
      );

      setPhase(
        PHASE.IDLE
      );
    }
  }, [
    recoveryOwnerKey,
  ]);

  const activePiece =
    drag &&
    runtime?.state?.tray?.[
      drag.trayIndex
    ];

  const preview =
    useMemo(() => {
      if (
        !drag ||
        !activePiece ||
        !Number.isInteger(
          drag.row
        ) ||
        !Number.isInteger(
          drag.col
        )
      ) {
        return null;
      }

      const valid =
        canPlacePiece(
          runtime.state.board,
          activePiece,
          drag.row,
          drag.col
        );

      const cells =
        activePiece.cells.map(
          ([dr, dc]) => ({
            row:
              drag.row + dr,
            col:
              drag.col + dc,
          })
        );

      return {
        valid,
        cells,
      };
    }, [
      drag,
      activePiece,
      runtime,
    ]);

  const previewMap =
    useMemo(() => {
      const map =
        new Map();

      if (!preview) {
        return map;
      }

      for (
        const cell of
        preview.cells
      ) {
        map.set(
          `${cell.row}:${cell.col}`,
          preview.valid
        );
      }

      return map;
    }, [preview]);

  const submitRuntime =
    useCallback(
      async (
        terminalRuntime
      ) => {
        if (
          !terminalRuntime ||
          terminalRuntime.state
            ?.ended !== true ||
          submitInFlightRef
            .current
        ) {
          return;
        }

        submitInFlightRef
          .current = true;

        setPhase(
          PHASE.SUBMITTING
        );

        setError("");

        try {
          const submission =
            await submitAuthorizedBlockPuzzleReplay({
              sessionId:
                terminalRuntime
                  .session
                  .session_id,

              replay:
                terminalRuntime
                  .replay,
            });

          const finalRuntime =
            applyAuthoritativeBlockPuzzleSubmission(
              terminalRuntime,
              submission
            );

          runtimeRef.current =
            finalRuntime;

          clearBlockPuzzleRecovery();

          if (
            mountedRef.current
          ) {
            setRuntime(
              finalRuntime
            );

            setPhase(
              PHASE.COMPLETE
            );
          }
        } catch (submitError) {
          const code =
            submitError
              ?.response
              ?.data
              ?.code ||
            submitError?.code ||
            "";

          if (
            code ===
            "BLOCK_PUZZLE_SESSION_EXPIRED"
          ) {
            clearBlockPuzzleRecovery();

            if (
              mountedRef.current
            ) {
              setError(
                "Ván chơi đã hết hạn và không thể gửi điểm."
              );

              setPhase(
                PHASE.EXPIRED
              );
            }
          } else if (
            mountedRef.current
          ) {
            setError(
              errorMessage(
                submitError,
                "Không thể xác minh kết quả. Hãy thử gửi lại."
              )
            );

            setPhase(
              PHASE.SUBMIT_ERROR
            );
          }
        } finally {
          submitInFlightRef
            .current = false;
        }
      },
      []
    );

  const startGame =
    useCallback(
      async () => {
        if (
          startInFlightRef
            .current ||
          phase ===
            PHASE.PLAYING ||
          phase ===
            PHASE.SUBMITTING
        ) {
          return;
        }

        if (
          !recoveryOwnerKey
        ) {
          setError(
            "Không xác định được tài khoản thành viên."
          );

          setPhase(
            PHASE.START_ERROR
          );

          return;
        }

        startInFlightRef.current =
          true;

        if (
          !requestIdRef.current
        ) {
          requestIdRef.current =
            createBlockPuzzleRequestId();
        }

        const persisted =
          persistBlockPuzzlePendingStart({
            ownerKey:
              recoveryOwnerKey,

            requestId:
              requestIdRef.current,
          });

        if (!persisted) {
          startInFlightRef.current =
            false;

          setError(
            "Thiết bị không thể lưu trạng thái ván chơi an toàn."
          );

          setPhase(
            PHASE.START_ERROR
          );

          return;
        }

        setError("");

        setPhase(
          PHASE.STARTING
        );

        try {
          const session =
            await startAuthorizedBlockPuzzleSession({
              requestId:
                requestIdRef
                  .current,
            });

          const nextRuntime =
            createAuthorizedBlockPuzzleRuntime(
              session
            );

          runtimeRef.current =
            nextRuntime;

          persistBlockPuzzleRuntime({
            ownerKey:
              recoveryOwnerKey,

            requestId:
              requestIdRef.current,

            runtime:
              nextRuntime,
          });

          if (
            mountedRef.current
          ) {
            setRuntime(
              nextRuntime
            );

            setDrag(null);

            setPhase(
              PHASE.PLAYING
            );
          }
        } catch (startError) {
          const code =
            startError
              ?.response
              ?.data
              ?.code ||
            startError?.code ||
            "";

          if (
            code ===
            "BLOCK_PUZZLE_SESSION_EXPIRED"
          ) {
            clearBlockPuzzleRecovery();

            requestIdRef.current =
              null;

            runtimeRef.current =
              null;

            if (
              mountedRef.current
            ) {
              setRuntime(null);

              setError(
                "Yêu cầu tạo ván trước đã hết hạn. Bạn có thể bắt đầu một ván mới."
              );

              setPhase(
                PHASE.IDLE
              );
            }
          } else if (
            code ===
            "BLOCK_PUZZLE_SESSION_STATUS_INVALID"
          ) {
            clearBlockPuzzleRecovery();

            requestIdRef.current =
              null;

            runtimeRef.current =
              null;

            if (
              mountedRef.current
            ) {
              setRuntime(null);

              setError(
                "Ván trước đã kết thúc và không thể tiếp tục từ yêu cầu cũ."
              );

              setPhase(
                PHASE.IDLE
              );
            }
          } else if (
            mountedRef.current
          ) {
            setError(
              errorMessage(
                startError,
                "Không thể bắt đầu ván chơi."
              )
            );

            /*
             * Ambiguous/network failure intentionally
             * preserves request_id for exact retry.
             */
            setPhase(
              PHASE.START_ERROR
            );
          }
        } finally {
          startInFlightRef.current =
            false;
        }
      },
      [
        phase,
        recoveryOwnerKey,
      ]
    );

  const updateDrag =
    useCallback(
      (
        event,
        current
      ) => {
        const rect =
          boardRef.current
            ?.getBoundingClientRect();

        const origin =
          resolveBoardDropOrigin({
            clientX:
              event.clientX,
            clientY:
              event.clientY,
            boardRect:
              rect,
            anchorRow:
              current.anchorRow,
            anchorCol:
              current.anchorCol,
          });

        return {
          ...current,

          row:
            origin?.row ??
            null,

          col:
            origin?.col ??
            null,
        };
      },
      []
    );

  const beginDrag =
    useCallback(
      (
        event,
        trayIndex,
        anchorRow,
        anchorCol
      ) => {
        if (
          phase !==
            PHASE.PLAYING ||
          !runtimeRef.current
            ?.state?.tray?.[
              trayIndex
            ]
        ) {
          return;
        }

        event.preventDefault();

        event.currentTarget
          .setPointerCapture?.(
            event.pointerId
          );

        const initial =
          updateDrag(
            event,
            {
              pointerId:
                event.pointerId,

              trayIndex,
              anchorRow,
              anchorCol,
              row: null,
              col: null,
            }
          );

        setDrag(
          initial
        );

        const target =
          event.currentTarget;

        const move = (
          moveEvent
        ) => {
          if (
            moveEvent.pointerId !==
            event.pointerId
          ) {
            return;
          }

          moveEvent
            .preventDefault();

          setDrag(
            (current) => {
              if (
                !current ||
                current.pointerId !==
                  moveEvent.pointerId
              ) {
                return current;
              }

              return updateDrag(
                moveEvent,
                current
              );
            }
          );
        };

        const finish = (
          upEvent
        ) => {
          if (
            upEvent.pointerId !==
            event.pointerId
          ) {
            return;
          }

          target.removeEventListener(
            "pointermove",
            move
          );

          target.removeEventListener(
            "pointerup",
            finish
          );

          target.removeEventListener(
            "pointercancel",
            cancel
          );

          const latest =
            updateDrag(
              upEvent,
              {
                pointerId:
                  upEvent.pointerId,

                trayIndex,
                anchorRow,
                anchorCol,
                row: null,
                col: null,
              }
            );

          setDrag(null);

          const currentRuntime =
            runtimeRef.current;

          const piece =
            currentRuntime
              ?.state?.tray?.[
                trayIndex
              ];

          if (
            !piece ||
            !Number.isInteger(
              latest.row
            ) ||
            !Number.isInteger(
              latest.col
            ) ||
            !canPlacePiece(
              currentRuntime
                .state.board,
              piece,
              latest.row,
              latest.col
            )
          ) {
            return;
          }

          const nextRuntime =
            applyAuthorizedBlockPuzzleMove(
              currentRuntime,
              {
                trayIndex,
                row:
                  latest.row,
                col:
                  latest.col,
              }
            );

          runtimeRef.current =
            nextRuntime;

          persistBlockPuzzleRuntime({
            ownerKey:
              recoveryOwnerKey,

            requestId:
              requestIdRef.current,

            runtime:
              nextRuntime,
          });

          if (
            mountedRef.current
          ) {
            setRuntime(
              nextRuntime
            );
          }

          if (
            nextRuntime.state
              .ended
          ) {
            void submitRuntime(
              nextRuntime
            );
          }
        };

        const cancel = (
          cancelEvent
        ) => {
          if (
            cancelEvent.pointerId !==
            event.pointerId
          ) {
            return;
          }

          target.removeEventListener(
            "pointermove",
            move
          );

          target.removeEventListener(
            "pointerup",
            finish
          );

          target.removeEventListener(
            "pointercancel",
            cancel
          );

          setDrag(null);
        };

        target.addEventListener(
          "pointermove",
          move,
          {
            passive: false,
          }
        );

        target.addEventListener(
          "pointerup",
          finish
        );

        target.addEventListener(
          "pointercancel",
          cancel
        );
      },
      [
        phase,
        recoveryOwnerKey,
        submitRuntime,
        updateDrag,
      ]
    );

  const newGame =
    useCallback(() => {
      runtimeRef.current =
        null;

      requestIdRef.current =
        null;

      submitInFlightRef.current =
        false;

      startInFlightRef.current =
        false;

      clearBlockPuzzleRecovery();

      setRuntime(null);
      setDrag(null);
      setError("");
      setPhase(PHASE.IDLE);
    }, []);

  const exit =
    () => {
      if (onExit) {
        onExit();
        return;
      }

      navigate(
        "/game-center"
      );
    };

  const board =
    runtime?.state?.board;

  const gameStarted =
    Boolean(board);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        overflow: "hidden",
        background:
          "linear-gradient(180deg,#fff8ee 0%,#f6dfbf 58%,#d6a76b 100%)",
        color: "#2b160b",
        userSelect: "none",
      }}
    >
      <div
        style={{
          height: "100%",
          boxSizing:
            "border-box",
          display: "flex",
          flexDirection:
            "column",
          padding:
            "max(env(safe-area-inset-top,0px) + 12px,44px) 16px calc(env(safe-area-inset-bottom,0px) + 14px)",
        }}
      >
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent:
              "space-between",
            gap: 12,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems:
                "center",
              gap: 10,
            }}
          >
            <img
              src="/logo-cing.png"
              alt="Cing"
              style={{
                width: 42,
                height: 42,
                objectFit:
                  "contain",
                borderRadius: 12,
              }}
            />

            <div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 900,
                  letterSpacing: 2,
                  color: "#b46a2a",
                }}
              >
                CING MINI GAME
              </div>

              <div
                style={{
                  fontSize: 18,
                  fontWeight: 950,
                }}
              >
                Block Puzzle
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={exit}
            style={{
              height: 40,
              padding: "0 14px",
              borderRadius: 14,
              border: "none",
              background:
                "#2b160b",
              color: "white",
              fontWeight: 900,
            }}
          >
            Game Center
          </button>
        </header>

        <section
          style={{
            height: 78,
            marginTop: 12,
            display: "grid",
            gridTemplateColumns:
              "repeat(3,1fr)",
            gap: 8,
            flexShrink: 0,
          }}
        >
          {[
            [
              "ĐIỂM",
              runtime?.state
                ?.score ?? 0,
            ],
            [
              "COMBO",
              runtime?.state
                ?.combo ?? 0,
            ],
            [
              "KỶ LỤC COMBO",
              runtime?.state
                ?.bestCombo ?? 0,
            ],
          ].map(
            ([label, value]) => (
              <div
                key={label}
                style={{
                  background:
                    "rgba(255,255,255,0.66)",
                  border:
                    "1px solid rgba(120,66,22,0.12)",
                  borderRadius: 16,
                  display: "flex",
                  flexDirection:
                    "column",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  boxShadow:
                    "0 7px 22px rgba(85,43,12,0.08)",
                }}
              >
                <div
                  style={{
                    fontSize: 9,
                    fontWeight: 900,
                    letterSpacing: 1,
                    color: "#9b6335",
                    textAlign:
                      "center",
                  }}
                >
                  {label}
                </div>

                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 950,
                  }}
                >
                  {value}
                </div>
              </div>
            )
          )}
        </section>

        <main
          style={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection:
              "column",
            alignItems:
              "center",
            justifyContent:
              "center",
            gap: 18,
          }}
        >
          {!gameStarted ? (
            <div
              style={{
                width:
                  "min(360px,100%)",
                padding:
                  "28px 22px",
                boxSizing:
                  "border-box",
                borderRadius: 26,
                background:
                  "rgba(255,255,255,0.72)",
                border:
                  "1px solid rgba(120,66,22,0.12)",
                textAlign:
                  "center",
                boxShadow:
                  "0 18px 50px rgba(70,35,10,0.12)",
              }}
            >
              <div
                style={{
                  fontSize: 48,
                  marginBottom: 8,
                }}
              >
                🧩
              </div>

              <h2
                style={{
                  margin:
                    "0 0 8px",
                  fontSize: 25,
                  fontWeight: 950,
                }}
              >
                Cing Block Puzzle
              </h2>

              <p
                style={{
                  margin:
                    "0 0 18px",
                  fontSize: 13,
                  lineHeight: 1.55,
                  color: "#79502f",
                  fontWeight: 700,
                }}
              >
                Xếp các khối vào
                bàn 8×8. Hoàn
                thành hàng hoặc
                cột để ghi điểm.
              </p>

              {error && (
                <p
                  style={{
                    color:
                      "#a73322",
                    fontSize: 12,
                    fontWeight: 800,
                  }}
                >
                  {error}
                </p>
              )}

              <button
                type="button"
                disabled={
                  phase ===
                  PHASE.STARTING
                }
                onClick={
                  startGame
                }
                style={{
                  width: "100%",
                  height: 50,
                  border: "none",
                  borderRadius: 16,
                  background:
                    "linear-gradient(135deg,#d4531c,#ff7a32)",
                  color: "white",
                  fontSize: 15,
                  fontWeight: 950,
                  opacity:
                    phase ===
                    PHASE.STARTING
                      ? 0.6
                      : 1,
                }}
              >
                {phase ===
                PHASE.STARTING
                  ? "Đang tạo ván..."
                  : phase ===
                    PHASE.START_ERROR
                    ? "Thử lại"
                    : "Bắt đầu · 1 lượt"}
              </button>
            </div>
          ) : (
            <>
              <div
                ref={boardRef}
                style={{
                  width:
                    "min(calc(100vw - 32px), 430px)",
                  aspectRatio:
                    "1 / 1",
                  display: "grid",
                  gridTemplateColumns:
                    `repeat(${BOARD_SIZE},1fr)`,
                  gridTemplateRows:
                    `repeat(${BOARD_SIZE},1fr)`,
                  background:
                    "#5d351d",
                  border:
                    "5px solid #5d351d",
                  borderRadius: 19,
                  overflow:
                    "hidden",
                  boxShadow:
                    "0 14px 34px rgba(65,30,8,0.22)",
                  touchAction:
                    "none",
                }}
              >
                {board.flatMap(
                  (
                    row,
                    rowIndex
                  ) =>
                    row.map(
                      (
                        value,
                        colIndex
                      ) => {
                        const key =
                          `${rowIndex}:${colIndex}`;

                        const previewValid =
                          previewMap.get(
                            key
                          );

                        let background =
                          value === 1
                            ? "linear-gradient(145deg,#ffb25b,#d4531c)"
                            : "#f9e9d0";

                        if (
                          previewValid ===
                          true
                        ) {
                          background =
                            "#f6bd60";
                        }

                        if (
                          previewValid ===
                          false
                        ) {
                          background =
                            "#d96b5c";
                        }

                        return (
                          <div
                            key={key}
                            style={{
                              boxSizing:
                                "border-box",
                              border:
                                "1px solid rgba(93,53,29,0.18)",
                              background,
                            }}
                          />
                        );
                      }
                    )
                )}
              </div>

              <div
                style={{
                  width:
                    "min(calc(100vw - 24px), 450px)",
                  display: "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "space-around",
                  minHeight: 104,
                }}
              >
                {runtime.state.tray.map(
                  (
                    piece,
                    trayIndex
                  ) => (
                    <PieceView
                      key={
                        piece
                          ?.instanceId ||
                        `empty-${trayIndex}`
                      }
                      piece={piece}
                      trayIndex={
                        trayIndex
                      }
                      disabled={
                        phase !==
                          PHASE.PLAYING
                      }
                      onPointerStart={
                        beginDrag
                      }
                    />
                  )
                )}
              </div>
            </>
          )}
        </main>

        {gameStarted &&
          phase ===
            PHASE.SUBMITTING && (
            <div
              style={{
                position:
                  "absolute",
                inset: 0,
                zIndex: 30,
                background:
                  "rgba(43,22,11,0.68)",
                display: "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                color: "white",
                fontWeight: 950,
                fontSize: 16,
              }}
            >
              Đang xác minh kết quả...
            </div>
          )}

        {gameStarted &&
          phase ===
            PHASE.SUBMIT_ERROR && (
            <div
              style={{
                position:
                  "absolute",
                inset: 0,
                zIndex: 31,
                background:
                  "rgba(43,22,11,0.78)",
                display: "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                padding: 20,
              }}
            >
              <div
                style={{
                  width:
                    "min(340px,100%)",
                  padding: 22,
                  borderRadius: 24,
                  background:
                    "#fff8ee",
                  textAlign:
                    "center",
                }}
              >
                <h3
                  style={{
                    margin:
                      "0 0 8px",
                  }}
                >
                  Chưa xác minh được
                  kết quả
                </h3>

                <p
                  style={{
                    fontSize: 13,
                    color: "#79502f",
                  }}
                >
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    submitRuntime(
                      runtimeRef
                        .current
                    )
                  }
                  style={{
                    width: "100%",
                    height: 46,
                    border: "none",
                    borderRadius: 14,
                    background:
                      "#d4531c",
                    color: "white",
                    fontWeight: 950,
                  }}
                >
                  Gửi lại kết quả
                </button>
              </div>
            </div>
          )}

        {gameStarted &&
          phase ===
            PHASE.EXPIRED && (
            <div
              style={{
                position:
                  "absolute",
                inset: 0,
                zIndex: 32,
                background:
                  "rgba(43,22,11,0.78)",
                display: "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                padding: 20,
              }}
            >
              <div
                style={{
                  width:
                    "min(340px,100%)",
                  padding: 24,
                  borderRadius: 26,
                  background:
                    "#fff8ee",
                  textAlign:
                    "center",
                }}
              >
                <div
                  style={{
                    fontSize: 42,
                  }}
                >
                  ⏱️
                </div>

                <h3>
                  Ván chơi đã hết hạn
                </h3>

                <p
                  style={{
                    fontSize: 13,
                    color: "#79502f",
                  }}
                >
                  {error}
                </p>

                <button
                  type="button"
                  onClick={
                    newGame
                  }
                  style={{
                    width: "100%",
                    height: 48,
                    border: "none",
                    borderRadius: 15,
                    background:
                      "#d4531c",
                    color: "white",
                    fontWeight: 950,
                  }}
                >
                  Bắt đầu ván mới
                </button>
              </div>
            </div>
          )}

        {gameStarted &&
          phase ===
            PHASE.COMPLETE && (
            <div
              style={{
                position:
                  "absolute",
                inset: 0,
                zIndex: 32,
                background:
                  "rgba(43,22,11,0.78)",
                display: "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                padding: 20,
              }}
            >
              <div
                style={{
                  width:
                    "min(340px,100%)",
                  padding: 24,
                  borderRadius: 26,
                  background:
                    "#fff8ee",
                  textAlign:
                    "center",
                }}
              >
                <div
                  style={{
                    fontSize: 48,
                  }}
                >
                  🏆
                </div>

                <div
                  style={{
                    fontSize: 12,
                    letterSpacing: 2,
                    fontWeight: 900,
                    color: "#a66a34",
                    marginTop: 8,
                  }}
                >
                  ĐIỂM ĐÃ XÁC MINH
                </div>

                <div
                  style={{
                    fontSize: 56,
                    fontWeight: 950,
                    margin:
                      "4px 0 18px",
                  }}
                >
                  {runtime
                    .finalScore}
                </div>

                <button
                  type="button"
                  onClick={
                    newGame
                  }
                  style={{
                    width: "100%",
                    height: 48,
                    border: "none",
                    borderRadius: 15,
                    background:
                      "linear-gradient(135deg,#d4531c,#ff7a32)",
                    color: "white",
                    fontWeight: 950,
                  }}
                >
                  Ván mới
                </button>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
