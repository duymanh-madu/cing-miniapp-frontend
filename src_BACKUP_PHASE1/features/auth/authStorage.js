/**
 * ============================================
 * AUTH STORAGE
 * ============================================
 */

const TOKEN_KEY =
  "cing_access_token";

const USER_KEY =
  "cing_user";

/**
 * ============================================
 * TOKEN
 * ============================================
 */

export function saveToken(
  token
) {
  localStorage.setItem(
    TOKEN_KEY,
    token
  );
}

export function getToken() {
  return localStorage.getItem(
    TOKEN_KEY
  );
}

export function removeToken() {
  localStorage.removeItem(
    TOKEN_KEY
  );
}

/**
 * ============================================
 * USER
 * ============================================
 */

export function saveUser(
  user
) {
  localStorage.setItem(
    USER_KEY,
    JSON.stringify(user)
  );
}

export function getUser() {
  const raw =
    localStorage.getItem(
      USER_KEY
    );

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function removeUser() {
  localStorage.removeItem(
    USER_KEY
  );
}

/**
 * ============================================
 * CLEAR AUTH
 * ============================================
 */

export function clearAuth() {
  removeToken();

  removeUser();
}