import {
  AUTH_CONFIG,
} from "../config/authConfig";

export function setRefreshToken(
  token
) {

  localStorage.setItem(

    AUTH_CONFIG
      .REFRESH_STORAGE_KEY,

    token

  );

}

export function getRefreshToken() {

  return localStorage.getItem(

    AUTH_CONFIG
      .REFRESH_STORAGE_KEY

  );

}

export function clearRefreshToken() {

  localStorage.removeItem(

    AUTH_CONFIG
      .REFRESH_STORAGE_KEY

  );

}