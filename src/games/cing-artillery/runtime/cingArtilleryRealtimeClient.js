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
  });

const ACK_TIMEOUT_MS =
  12000;

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

  let connectedOnce =
    false;

  let recoveryInFlight =
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
          const snapshot =
            await readBattleSnapshot(
              id
            );

          if (
            typeof onBattleSnapshot ===
            "function"
          ) {
            onBattleSnapshot(
              snapshot
            );
          }
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
    leaveMatch,
    destroy,

    isConnected:
      () =>
        socket.connected,
  };
}
