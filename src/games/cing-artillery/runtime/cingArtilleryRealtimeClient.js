import {
  io,
} from "socket.io-client";

import {
  getAccessToken,
} from "@/infra/auth/authStorage";

const EVENT =
  Object.freeze({
    JOIN:
      "cing-artillery:match:join",

    LEAVE:
      "cing-artillery:match:leave",

    READINESS:
      "cing-artillery:match:readiness",

    TURN_STATE:
      "cing-artillery:match:turn-state",

    START_ERROR:
      "cing-artillery:match:start-error",

    BATTLE_SNAPSHOT:
      "cing-artillery:match:battle-snapshot",

    SHOT_COMMAND:
      "cing-artillery:match:shot-command",

    RESULT_CATCHUP:
      "cing-artillery:match:result-catchup",

    RESULT_STREAM_WAKE:
      "cing-artillery:match:result-stream-wake",
  });

const ACK_TIMEOUT_MS =
  12000;

const RESULT_CATCHUP_LIMIT =
  32;

const RESULT_CATCHUP_RETRY_DELAYS_MS =
  Object.freeze([
    0,
    80,
    160,
    320,
    640,
    1000,
    1400,
  ]);

function requireGameServerUrl() {
  const value =
    String(
      import.meta.env
        .VITE_GAME_SERVER_URL ||
      ""
    ).trim();

  if (!value) {
    const error =
      new Error(
        "Thiếu cấu hình game server Cing Piu Piu"
      );

    error.code =
      "CING_PIU_PIU_GAME_SERVER_URL_MISSING";

    throw error;
  }

  return value;
}

function requireAccessToken() {
  const token =
    String(
      getAccessToken() || ""
    ).trim();

  if (!token) {
    const error =
      new Error(
        "Phiên đăng nhập đã hết hạn"
      );

    error.code =
      "CING_PIU_PIU_AUTH_TOKEN_MISSING";

    throw error;
  }

  return token;
}

function emitAcknowledged(
  socket,
  event,
  payload
) {
  return new Promise(
    (
      resolve,
      reject
    ) => {
      let settled =
        false;

      const timer =
        window.setTimeout(
          () => {
            if (settled) {
              return;
            }

            settled =
              true;

            const error =
              new Error(
                "Máy chủ trò chơi phản hồi quá chậm"
              );

            error.code =
              "CING_PIU_PIU_ACK_TIMEOUT";

            reject(
              error
            );
          },
          ACK_TIMEOUT_MS
        );

      socket.emit(
        event,
        payload,
        (
          acknowledgement
        ) => {
          if (settled) {
            return;
          }

          settled =
            true;

          window.clearTimeout(
            timer
          );

          if (
            !acknowledgement ||
            acknowledgement.success !==
              true
          ) {
            const error =
              new Error(
                acknowledgement
                  ?.message ||
                "Realtime Cing Piu Piu từ chối yêu cầu"
              );

            error.code =
              acknowledgement
                ?.code ||
              "CING_PIU_PIU_REALTIME_ERROR";

            reject(
              error
            );

            return;
          }

          resolve(
            acknowledgement.data
          );
        }
      );
    }
  );
}

export function
createCingArtilleryRealtimeClient({
  onReadiness,
  onTurnState,
  onStartError,
  onDisconnected,
  onBattleSnapshot,
  onResultStreamWake,
  onRecovered,
}) {
  const token =
    requireAccessToken();

  const socket =
    io(
      requireGameServerUrl(),
      {
        auth: {
          token,
        },

        transports: [
          "websocket",
          "polling",
        ],

        autoConnect:
          false,

        forceNew:
          true,

        withCredentials:
          true,

        reconnection:
          true,

        reconnectionAttempts:
          Infinity,

        reconnectionDelay:
          900,

        reconnectionDelayMax:
          5000,

        randomizationFactor:
          0.35,

        timeout:
          15000,
      }
    );

  if (
    typeof onReadiness ===
    "function"
  ) {
    socket.on(
      EVENT.READINESS,
      onReadiness
    );
  }

  if (
    typeof onTurnState ===
    "function"
  ) {
    socket.on(
      EVENT.TURN_STATE,
      onTurnState
    );
  }

  if (
    typeof onStartError ===
    "function"
  ) {
    socket.on(
      EVENT.START_ERROR,
      onStartError
    );
  }

  if (
    typeof onDisconnected ===
    "function"
  ) {
    socket.on(
      "disconnect",
      onDisconnected
    );
  }

  let joinedMatchId =
    null;

  let resultCursor =
    "0";

  let connectedOnce =
    false;

  let recoveryInFlight =
    null;

  let resultRecoveryInFlight =
    null;

  async function connect() {
    if (socket.connected) {
      return;
    }

    await new Promise(
      (
        resolve,
        reject
      ) => {
        let settled =
          false;

        const timer =
          window.setTimeout(
            () => {
              if (settled) {
                return;
              }

              settled =
                true;

              socket.off(
                "connect",
                handleConnect
              );

              socket.off(
                "connect_error",
                handleError
              );

              const error =
                new Error(
                  "Không thể kết nối máy chủ Cing Piu Piu"
                );

              error.code =
                "CING_PIU_PIU_CONNECT_TIMEOUT";

              reject(
                error
              );
            },
            15000
          );

        const finish =
          () => {
            window.clearTimeout(
              timer
            );

            socket.off(
              "connect",
              handleConnect
            );

            socket.off(
              "connect_error",
              handleError
            );
          };

        const handleConnect =
          () => {
            if (settled) {
              return;
            }

            settled =
              true;

            finish();
            resolve();
          };

        const handleError =
          (cause) => {
            if (settled) {
              return;
            }

            settled =
              true;

            finish();

            const error =
              new Error(
                cause?.message ||
                "Không thể kết nối máy chủ Cing Piu Piu"
              );

            error.code =
              "CING_PIU_PIU_CONNECT_ERROR";

            reject(
              error
            );
          };

        socket.once(
          "connect",
          handleConnect
        );

        socket.once(
          "connect_error",
          handleError
        );

        socket.connect();
      }
    );
  }

  async function performJoin(
    id
  ) {
    const data =
      await emitAcknowledged(
        socket,
        EVENT.JOIN,
        {
          matchId:
            id,
        }
      );

    if (
      data?.match_id !== id ||
      !data?.runtime_id ||
      !data?.gameplay_session_id ||
      (
        data?.player !==
          "player_one" &&
        data?.player !==
          "player_two"
      )
    ) {
      throw new Error(
        "Realtime join authority Cing Piu Piu không hợp lệ"
      );
    }

    joinedMatchId =
      id;

    return data;
  }

  async function joinMatch(
    matchId
  ) {
    const id =
      String(
        matchId || ""
      ).trim();

    if (!id) {
      throw new Error(
        "Thiếu match identity Cing Piu Piu"
      );
    }

    await connect();

    return performJoin(
      id
    );
  }

  function normalizeResultSequence(
    value
  ) {
    const sequence =
      String(
        value ?? ""
      ).trim();

    if (
      !/^(0|[1-9][0-9]*)$/u.test(
        sequence
      )
    ) {
      throw new Error(
        "Result cursor Cing Piu Piu không hợp lệ"
      );
    }

    return sequence;
  }

  function compareResultSequence(
    left,
    right
  ) {
    const a =
      normalizeResultSequence(
        left
      );

    const b =
      normalizeResultSequence(
        right
      );

    if (a.length !== b.length) {
      return a.length < b.length
        ? -1
        : 1;
    }

    if (a === b) {
      return 0;
    }

    return a < b
      ? -1
      : 1;
  }

  function advanceResultCursor(
    rows
  ) {
    let next =
      resultCursor;

    for (const row of rows) {
      const sequence =
        normalizeResultSequence(
          row?.result_sequence
        );

      if (
        compareResultSequence(
          sequence,
          next
        ) <= 0
      ) {
        throw new Error(
          "Result stream Cing Piu Piu không tăng đơn điệu"
        );
      }

      next =
        sequence;
    }

    resultCursor =
      next;

    return resultCursor;
  }

  async function readResultCatchup({
    matchId =
      joinedMatchId,
    limit = 32,
  } = {}) {
    const id =
      String(
        matchId || ""
      ).trim();

    if (!id) {
      throw new Error(
        "Thiếu match identity để đọc result stream"
      );
    }

    if (
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > 100
    ) {
      throw new Error(
        "Result stream limit Cing Piu Piu không hợp lệ"
      );
    }

    await connect();

    const data =
      await emitAcknowledged(
        socket,
        EVENT.RESULT_CATCHUP,
        {
          matchId:
            id,

          afterSequence:
            resultCursor,

          limit,
        }
      );

    if (
      data?.match_id !== id ||
      !data?.runtime_id ||
      !Array.isArray(
        data?.results
      )
    ) {
      throw new Error(
        "Result catch-up Cing Piu Piu không hợp lệ"
      );
    }

    advanceResultCursor(
      data.results
    );

    return data;
  }

  async function sendShot({
    matchId =
      joinedMatchId,
    commandId,
    turnNumber,
    angleDeg,
    power,
  }) {
    const id =
      String(
        matchId || ""
      ).trim();

    if (!id) {
      throw new Error(
        "Thiếu match identity để gửi shot command"
      );
    }

    await connect();

    return emitAcknowledged(
      socket,
      EVENT.SHOT_COMMAND,
      {
        matchId:
          id,

        commandId,
        turnNumber,
        angleDeg,
        power,
      }
    );
  }

  async function readBattleSnapshot(
    matchId =
      joinedMatchId
  ) {
    const id =
      String(
        matchId || ""
      ).trim();

    if (!id) {
      throw new Error(
        "Thiếu match identity để đọc battle snapshot"
      );
    }

    await connect();

    const snapshot =
      await emitAcknowledged(
        socket,
        EVENT.BATTLE_SNAPSHOT,
        {
          matchId:
            id,
        }
      );

    if (
      snapshot?.match_id !==
        id ||
      !snapshot?.runtime_id ||
      !snapshot?.combat_state_id ||
      !snapshot?.viewer?.account_id ||
      !snapshot?.world?.id ||
      !snapshot?.world?.map_id ||
      !snapshot?.vital?.id ||
      !snapshot?.turn?.id
    ) {
      throw new Error(
        "Battle snapshot Cing Piu Piu không hợp lệ"
      );
    }

    return snapshot;
  }

  function waitForResultRecovery(
    milliseconds
  ) {
    if (milliseconds <= 0) {
      return Promise.resolve();
    }

    return new Promise(
      (resolve) => {
        window.setTimeout(
          resolve,
          milliseconds
        );
      }
    );
  }

  async function refreshCanonicalBattleSnapshot(
    matchId
  ) {
    const snapshot =
      await readBattleSnapshot(
        matchId
      );

    if (
      typeof onBattleSnapshot ===
      "function"
    ) {
      onBattleSnapshot(
        snapshot
      );
    }

    return snapshot;
  }

  async function recoverDurableResults({
    matchId =
      joinedMatchId,
    requireResult =
      false,
  } = {}) {
    const id =
      String(
        matchId || ""
      ).trim();

    if (!id) {
      return null;
    }

    if (resultRecoveryInFlight) {
      return resultRecoveryInFlight;
    }

    resultRecoveryInFlight =
      (async () => {
        for (
          let index = 0;
          index <
            RESULT_CATCHUP_RETRY_DELAYS_MS.length;
          index += 1
        ) {
          await waitForResultRecovery(
            RESULT_CATCHUP_RETRY_DELAYS_MS[
              index
            ]
          );

          if (
            joinedMatchId !== id
          ) {
            return null;
          }

          const data =
            await readResultCatchup({
              matchId:
                id,

              limit:
                RESULT_CATCHUP_LIMIT,
            });

          if (
            data.results.length > 0
          ) {
            await refreshCanonicalBattleSnapshot(
              id
            );

            return data;
          }

          if (!requireResult) {
            await refreshCanonicalBattleSnapshot(
              id
            );

            return data;
          }
        }

        /*
         * A wake is advisory only.
         *
         * The worker may legitimately take longer than this
         * bounded recovery window. Do not invent gameplay
         * state and do not poll forever. A later wake or
         * reconnect resumes from the durable cursor.
         */
        return null;
      })();

    try {
      return await resultRecoveryInFlight;
    } finally {
      resultRecoveryInFlight =
        null;
    }
  }

  async function recoverJoinedMatch() {
    if (
      !joinedMatchId ||
      recoveryInFlight
    ) {
      return recoveryInFlight;
    }

    const id =
      joinedMatchId;

    recoveryInFlight =
      (async () => {
        const authority =
          await performJoin(
            id
          );

        if (
          typeof onRecovered ===
          "function"
        ) {
          onRecovered(
            authority
          );
        }

        try {
          await recoverDurableResults({
            matchId:
              id,

            requireResult:
              false,
          });
        } catch (error) {
          /*
           * A reconnect may happen while both players are
           * still waiting and combat authority does not yet
           * exist. Rejoin itself remains authoritative.
           *
           * Once turn-state is emitted, the React boundary
           * performs another canonical snapshot read.
           */
          if (
            error?.code !==
              "CING_ARTILLERY_BATTLE_SNAPSHOT_NOT_READY" &&
            error?.code !==
              "CING_ARTILLERY_BATTLE_SNAPSHOT_COMBAT_NOT_READY"
          ) {
            throw error;
          }
        }

        return authority;
      })();

    try {
      return await recoveryInFlight;
    } finally {
      recoveryInFlight =
        null;
    }
  }

  socket.on(
    EVENT.RESULT_STREAM_WAKE,
    (wake) => {
      if (
        !joinedMatchId ||
        wake?.match_id !==
          joinedMatchId
      ) {
        return;
      }

      if (
        typeof onResultStreamWake ===
        "function"
      ) {
        onResultStreamWake(
          wake
        );
      }

      void recoverDurableResults({
        matchId:
          joinedMatchId,

        requireResult:
          true,
      }).catch(
        () => {
          /*
           * Wake recovery is transport reconciliation only.
           * Durable gameplay authority is never compensated
           * or synthesized on a failed catch-up.
           */
        }
      );
    }
  );

  socket.on(
    "connect",
    () => {
      if (!connectedOnce) {
        connectedOnce =
          true;

        return;
      }

      if (!joinedMatchId) {
        return;
      }

      void recoverJoinedMatch()
        .catch(
          () => {
            /*
             * Durable state is never compensated on
             * transport recovery failure.
             * Socket.IO continues its own reconnect cycle.
             */
          }
        );
    }
  );

  async function leaveMatch() {
    if (
      !socket.connected ||
      !joinedMatchId
    ) {
      return;
    }

    const matchId =
      joinedMatchId;

    joinedMatchId =
      null;

    try {
      await emitAcknowledged(
        socket,
        EVENT.LEAVE,
        {
          matchId,
        }
      );
    } catch {
      /*
       * Transport leave is best effort.
       * Durable gameplay state must never be
       * compensated or rewritten here.
       */
    }
  }

  async function destroy() {
    await leaveMatch();

    socket.removeAllListeners();
    socket.disconnect();
  }

  return {
    connect,
    joinMatch,
    readBattleSnapshot,
    readResultCatchup,
    recoverDurableResults,
    sendShot,
    leaveMatch,
    destroy,

    getResultCursor:
      () =>
        resultCursor,

    isConnected:
      () =>
        socket.connected,
  };
}
