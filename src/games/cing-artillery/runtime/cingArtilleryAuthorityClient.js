import apiClient
  from "@/infra/api/apiClient";

const BASE =
  "/game/cing-piu-piu";

function unwrap(
  response,
  fallbackMessage
) {
  const body =
    response?.data;

  if (
    !body ||
    body.success !== true
  ) {
    const error =
      new Error(
        body?.message ||
        fallbackMessage
      );

    error.code =
      body?.code ||
      "CING_PIU_PIU_HTTP_ERROR";

    throw error;
  }

  return body.data;
}

export async function
getCingArtilleryEntry() {
  const response =
    await apiClient.get(
      `${BASE}/entry`
    );

  return unwrap(
    response,
    "Không thể kiểm tra quyền truy cập Cing Piu Piu"
  );
}

export async function
createCingArtilleryGameplaySession() {
  const response =
    await apiClient.post(
      `${BASE}/session`,
      {}
    );

  const session =
    unwrap(
      response,
      "Không thể tạo phiên chơi Cing Piu Piu"
    );

  if (
    !session?.id ||
    session.status !== "active"
  ) {
    throw new Error(
      "Gameplay session Cing Piu Piu không hợp lệ"
    );
  }

  return session;
}

export async function
enterCingArtilleryMatchmaking(
  gameplaySessionId
) {
  const sessionId =
    String(
      gameplaySessionId || ""
    ).trim();

  if (!sessionId) {
    throw new Error(
      "Thiếu gameplay session Cing Piu Piu"
    );
  }

  const response =
    await apiClient.post(
      `${BASE}/matchmaking`,
      {
        gameplay_session_id:
          sessionId,
      }
    );

  const decision =
    unwrap(
      response,
      "Không thể ghép trận Cing Piu Piu"
    );

  if (
    decision?.status !== "waiting" &&
    decision?.status !== "matched"
  ) {
    throw new Error(
      "Matchmaking Cing Piu Piu trả trạng thái không hợp lệ"
    );
  }

  if (
    decision.status === "matched" &&
    !decision.match_id
  ) {
    throw new Error(
      "Matchmaking Cing Piu Piu thiếu match identity"
    );
  }

  return decision;
}
