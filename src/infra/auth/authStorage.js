import {getPersistedAuthSession} from "./persistedAuthSession.js";
const ACCESS_TOKEN_KEY  = "cing_access_token";
const REFRESH_TOKEN_KEY = "cing_refresh_token";

export function getAccessToken() {
  return getPersistedAuthSession().accessToken;
}

export function setAccessToken(token) {
  if (token) localStorage.setItem(ACCESS_TOKEN_KEY, token);
  else localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  return getPersistedAuthSession().refreshToken;
}

export function setRefreshToken(token) {
  if (token) localStorage.setItem(REFRESH_TOKEN_KEY, token);
  else localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function clearAuthStorage() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}
