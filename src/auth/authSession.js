import {
  getAccessToken,
} from "./authStorage";

export function hasSession() {
  return Boolean(
    getAccessToken()
  );
}