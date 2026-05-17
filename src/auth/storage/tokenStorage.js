import {
  AUTH_CONFIG,
} from "../config/authConfig";

export function setAccessToken(
  token
) {

  localStorage.setItem(

    AUTH_CONFIG
      .TOKEN_STORAGE_KEY,

    token

  );

}

export function getAccessToken() {

  return localStorage.getItem(

    AUTH_CONFIG
      .TOKEN_STORAGE_KEY

  );

}

export function clearAccessToken() {

  localStorage.removeItem(

    AUTH_CONFIG
      .TOKEN_STORAGE_KEY

  );

}