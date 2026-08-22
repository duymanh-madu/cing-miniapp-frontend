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
  resolveNearestPieceAnchor,
} from "./runtime/blockPuzzlePieceTouchGeometry.js";

import {
  persistBlockPuzzlePendingStart,
  persistBlockPuzzleRuntime,
  restoreBlockPuzzleRecovery,
  clearBlockPuzzleRecovery,
  isBlockPuzzleSessionExpired,
} from "./runtime/blockPuzzleRecovery.js";

import "./CingBlockPuzzle.css";

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
  dragging = false,
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
      className="cing-block-puzzle__piece-hitbox"
      onPointerDown={
        disabled
          ? undefined
          : (event) => {
              const rect =
                event.currentTarget
                  .getBoundingClientRect();

              const anchor =
                resolveNearestPieceAnchor({
                  clientX:
                    event.clientX,

                  clientY:
                    event.clientY,

                  slotRect: {
                    left:
                      rect.left,

                    top:
                      rect.top,

                    width:
                      rect.width,

                    height:
                      rect.height,
                  },

                  piece,
                  slotSize: 92,
                  cellSize: cell,
                });

              if (!anchor) {
                return;
              }

              onPointerStart(
                event,
                trayIndex,
                anchor.row,
                anchor.col
              );
            }
      }
      style={{
        width: 92,
        height: 92,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        touchAction: "none",
        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitTapHighlightColor:
          "transparent",
        opacity:
          disabled
            ? 0.38
            : dragging
              ? 0.18
              : 1,
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
          pointerEvents: "none",
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
                className="cing-block-puzzle__piece-cell"
                aria-hidden="true"
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

function FloatingPieceView({
  piece,
  cellWidth,
  cellHeight,
  floatingRef,
}) {
  if (
    !piece ||
    !Number.isFinite(cellWidth) ||
    !Number.isFinite(cellHeight) ||
    cellWidth <= 0 ||
    cellHeight <= 0
  ) {
    return null;
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
    new Set(
      piece.cells.map(
        ([row, col]) =>
          `${row}:${col}`
      )
    );

  return (
    <div
      ref={floatingRef}
      className="cing-block-puzzle__floating-piece"
      aria-hidden="true"
      style={{
        display: "grid",

        gridTemplateColumns:
          `repeat(${maxCol + 1}, ${cellWidth}px)`,

        gridTemplateRows:
          `repeat(${maxRow + 1}, ${cellHeight}px)`,
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

          const key =
            `${row}:${col}`;

          if (
            !occupied.has(key)
          ) {
            return (
              <div key={key} />
            );
          }

          return (
            <div
              key={key}
              className="cing-block-puzzle__floating-cell"
              style={{
                width:
                  cellWidth,

                height:
                  cellHeight,

                borderRadius:
                  Math.max(
                    5,
                    Math.floor(
                      Math.min(
                        cellWidth,
                        cellHeight
                      ) * 0.18
                    )
                  ),
              }}
            />
          );
        }
      )}
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

  const floatingPieceRef =
    useRef(null);

  const dragGestureRef =
    useRef(null);

  const dragPreviewRef =
    useRef(null);

  const dragPointRef =
    useRef(null);

  const dragFrameRef =
    useRef(null);

  const dragCleanupRef =
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

      dragCleanupRef.current?.();
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

  const beginDrag =
    useCallback(
      (
        event,
        trayIndex,
        anchorRow,
        anchorCol
      ) => {
        const currentRuntime =
          runtimeRef.current;

        const piece =
          currentRuntime
            ?.state?.tray?.[
              trayIndex
            ];

        if (
          phase !==
            PHASE.PLAYING ||
          !piece
        ) {
          return;
        }

        const domRect =
          boardRef.current
            ?.getBoundingClientRect();

        if (
          !domRect ||
          !Number.isFinite(
            domRect.left
          ) ||
          !Number.isFinite(
            domRect.top
          ) ||
          !Number.isFinite(
            domRect.width
          ) ||
          !Number.isFinite(
            domRect.height
          ) ||
          domRect.width <= 0 ||
          domRect.height <= 0
        ) {
          return;
        }

        event.preventDefault();

        dragCleanupRef.current?.();

        const target =
          event.currentTarget;

        target
          .setPointerCapture?.(
            event.pointerId
          );

        /*
         * Cache layout exactly once at pointerdown.
         * pointermove never reads layout.
         */
        const boardRect = {
          left:
            domRect.left,

          top:
            domRect.top,

          width:
            domRect.width,

          height:
            domRect.height,
        };

        const cellWidth =
          boardRect.width /
          BOARD_SIZE;

        const cellHeight =
          boardRect.height /
          BOARD_SIZE;

        const gesture = {
          pointerId:
            event.pointerId,

          trayIndex,
          anchorRow,
          anchorCol,
          boardRect,
          cellWidth,
          cellHeight,
          target,
        };

        dragGestureRef.current =
          gesture;

        const queueFloatingPosition =
          (
            clientX,
            clientY
          ) => {
            dragPointRef.current = {
              clientX,
              clientY,
            };

            if (
              dragFrameRef.current !==
              null
            ) {
              return;
            }

            dragFrameRef.current =
              requestAnimationFrame(
                () => {
                  dragFrameRef.current =
                    null;

                  const point =
                    dragPointRef.current;

                  const element =
                    floatingPieceRef
                      .current;

                  const active =
                    dragGestureRef
                      .current;

                  if (
                    !point ||
                    !element ||
                    !active
                  ) {
                    return;
                  }

                  const x =
                    point.clientX -
                    (
                      active.anchorCol +
                      0.5
                    ) *
                      active.cellWidth;

                  const y =
                    point.clientY -
                    (
                      active.anchorRow +
                      0.5
                    ) *
                      active.cellHeight;

                  element.style.transform =
                    `translate3d(${x}px, ${y}px, 0)`;
                }
              );
          };

        const publishPreview =
          (
            clientX,
            clientY
          ) => {
            const origin =
              resolveBoardDropOrigin({
                clientX,
                clientY,

                boardRect:
                  gesture.boardRect,

                anchorRow:
                  gesture.anchorRow,

                anchorCol:
                  gesture.anchorCol,
              });

            const row =
              origin?.row ??
              null;

            const col =
              origin?.col ??
              null;

            const previous =
              dragPreviewRef.current;

            /*
             * React updates only when the board target
             * cell changes, never for raw pointer pixels.
             */
            if (
              previous &&
              previous.row === row &&
              previous.col === col
            ) {
              return origin;
            }

            dragPreviewRef.current = {
              row,
              col,
            };

            setDrag({
              pointerId:
                gesture.pointerId,

              trayIndex:
                gesture.trayIndex,

              anchorRow:
                gesture.anchorRow,

              anchorCol:
                gesture.anchorCol,

              row,
              col,

              cellWidth:
                gesture.cellWidth,

              cellHeight:
                gesture.cellHeight,
            });

            return origin;
          };

        let cleaned = false;

        const cleanup =
          () => {
            if (cleaned) {
              return;
            }

            cleaned = true;

            window.removeEventListener(
              "pointermove",
              move
            );

            window.removeEventListener(
              "pointerup",
              finish
            );

            window.removeEventListener(
              "pointercancel",
              cancel
            );

            if (
              dragFrameRef.current !==
              null
            ) {
              cancelAnimationFrame(
                dragFrameRef.current
              );

              dragFrameRef.current =
                null;
            }

            dragPointRef.current =
              null;

            dragGestureRef.current =
              null;

            dragPreviewRef.current =
              null;

            dragCleanupRef.current =
              null;

            try {
              target
                .releasePointerCapture?.(
                  event.pointerId
                );
            } catch {
              /*
               * Capture may already be released by
               * the browser after pointerup/cancel.
               */
            }
          };

        const move =
          (
            moveEvent
          ) => {
            if (
              moveEvent.pointerId !==
                gesture.pointerId
            ) {
              return;
            }

            moveEvent.preventDefault();

            queueFloatingPosition(
              moveEvent.clientX,
              moveEvent.clientY
            );

            publishPreview(
              moveEvent.clientX,
              moveEvent.clientY
            );
          };

        const finish =
          (
            upEvent
          ) => {
            if (
              upEvent.pointerId !==
                gesture.pointerId
            ) {
              return;
            }

            upEvent.preventDefault();

            const latest =
              resolveBoardDropOrigin({
                clientX:
                  upEvent.clientX,

                clientY:
                  upEvent.clientY,

                boardRect:
                  gesture.boardRect,

                anchorRow:
                  gesture.anchorRow,

                anchorCol:
                  gesture.anchorCol,
              });

            cleanup();
            setDrag(null);

            const latestRuntime =
              runtimeRef.current;

            const latestPiece =
              latestRuntime
                ?.state?.tray?.[
                  gesture.trayIndex
                ];

            if (
              !latestPiece ||
              !Number.isInteger(
                latest?.row
              ) ||
              !Number.isInteger(
                latest?.col
              ) ||
              !canPlacePiece(
                latestRuntime
                  .state.board,
                latestPiece,
                latest.row,
                latest.col
              )
            ) {
              return;
            }

            const nextRuntime =
              applyAuthorizedBlockPuzzleMove(
                latestRuntime,
                {
                  trayIndex:
                    gesture.trayIndex,

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

        const cancel =
          (
            cancelEvent
          ) => {
            if (
              cancelEvent.pointerId !==
                gesture.pointerId
            ) {
              return;
            }

            cleanup();

            if (
              mountedRef.current
            ) {
              setDrag(null);
            }
          };

        dragCleanupRef.current =
          cleanup;

        /*
         * After pointerdown, the gesture is owned by
         * the stable window surface rather than the
         * React-rendered tray hitbox. This preserves
         * movement across rerenders and WebView
         * pointer-capture changes.
         */
        window.addEventListener(
          "pointermove",
          move,
          {
            passive: false,
          }
        );

        window.addEventListener(
          "pointerup",
          finish
        );

        window.addEventListener(
          "pointercancel",
          cancel
        );

        /*
         * Create one React drag snapshot and place
         * the floating layer immediately.
         */
        publishPreview(
          event.clientX,
          event.clientY
        );

        queueFloatingPosition(
          event.clientX,
          event.clientY
        );
      },
      [
        phase,
        recoveryOwnerKey,
        submitRuntime,
      ]
    );

  const newGame =
    useCallback(() => {
      dragCleanupRef.current?.();

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

                        const className = [
                          "cing-block-puzzle__board-cell",

                          value === 1
                            ? "cing-block-puzzle__board-cell--filled"
                            : "",

                          previewValid === true
                            ? "cing-block-puzzle__board-cell--preview-valid"
                            : "",

                          previewValid === false
                            ? "cing-block-puzzle__board-cell--preview-invalid"
                            : "",
                        ]
                          .filter(Boolean)
                          .join(" ");

                        return (
                          <div
                            key={key}
                            className={
                              className
                            }
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
                      dragging={
                        drag?.trayIndex ===
                          trayIndex
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

        {drag &&
          activePiece && (
            <FloatingPieceView
              piece={
                activePiece
              }
              cellWidth={
                drag.cellWidth
              }
              cellHeight={
                drag.cellHeight
              }
              floatingRef={
                floatingPieceRef
              }
            />
          )}

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
