/**
 * ============================================
 * AUTH STORAGE
 * ============================================
 */

const ACCESS_TOKEN_KEY =
  "cing_access_token";

const REFRESH_TOKEN_KEY =
  "cing_refresh_token";

const USER_KEY =
  "cing_user";

/**
 * ============================================
 * SAVE SESSION
 * ============================================
 */

export function saveSession({
  accessToken,

  refreshToken,

  user,
}) {
  localStorage.setItem(
    ACCESS_TOKEN_KEY,
    accessToken
  );

  localStorage.setItem(
    REFRESH_TOKEN_KEY,
    refreshToken
  );

  localStorage.setItem(
    USER_KEY,
    JSON.stringify(user)
  );
}

/**
 * ============================================
 * GET SESSION
 * ============================================
 */

export function getSession() {
  const accessToken =
    localStorage.getItem(
      ACCESS_TOKEN_KEY
    );

  const refreshToken =
    localStorage.getItem(
      REFRESH_TOKEN_KEY
    );

  const rawUser =
    localStorage.getItem(
      USER_KEY
    );

  let user = null;

  try {
    user = rawUser
      ? JSON.parse(
          rawUser
        )
      : null;
  } catch {
    user = null;
  }

  return {
    accessToken,

    refreshToken,

    user,
  };
}

/**
 * ============================================
 * CLEAR SESSION
 * ============================================
 */

export function clearSession() {
  localStorage.removeItem(
    ACCESS_TOKEN_KEY
  );

  localStorage.removeItem(
    REFRESH_TOKEN_KEY
  );

  localStorage.removeItem(
    USER_KEY
  );
}